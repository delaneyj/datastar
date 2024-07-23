module Main where

import Control.Applicative ( Alternative((<|>)) )
import Control.Concurrent ( threadDelay )
import Control.Exception ( SomeException, handle, throw )
import Control.Monad ( when )
import Control.Monad.IO.Class ( MonadIO(..) )
import Data.Aeson ( FromJSON, ToJSON, encode, decodeStrict )
import Data.ByteString.Builder ( Builder, hPutBuilder, byteString )
import Data.ByteString.Builder.Extra ( flush )
import Data.Convertible.Utf8 ( Convertible(..) )
import Data.Maybe ( fromMaybe )
import Data.String ( IsString )
import Data.Time.Clock ( getCurrentTime )
import GHC.Generics ( Generic )
import NeatInterpolation ( trimming )
import Snap
import Snap.Util.FileServe ( serveDirectory )
import System.IO
    ( hSetBuffering, stderr, stdout, BufferMode(NoBuffering) )
import System.Random ( RandomGen, mkStdGen, Random(randomR) )
import qualified System.IO.Streams as Streams
    ( OutputStream, write )

data Datastar = Datastar {
    input  :: !String
  , output :: !String
  , show   :: !Bool
  } deriving (Show, Generic)

instance FromJSON Datastar
instance ToJSON Datastar

target :: String  -- like const target = "target"; in server.js
target = "target"

makeIndexPage :: String -> Builder
makeIndexPage x = byteString . convert $ [trimming|
<head>
    <title>Haskell + Datastar Example</title>
    <script type="module" defer src="/datastar.js"></script>
</head>
<body>
    <h2>Haskell + Datastar Example</h2>
    <main class="container" id="main" data-store="{input:'', output:'', show: true}">
        <input type="text" placeholder="Send to server..." data-model="input"/>
        <button data-on-click="$$$$get('/get')">Send State Roundtrip</button>
        <button data-on-click="$$$$get('/target')">Target HTML Element</button>
        <button data-on-click="$$show=!$$show">Toggle Feed</button>
        <div id="output" data-text="$$output"></div>
        <div id="$y"></div>
        <div data-show="$$show">
            <span>Feed from server: </span>
            <span id="feed" data-on-load="$$$$get('/feed')"></span>
        </div>

        <h5>Datastar Store</h5>
        <pre data-text="JSON.stringify(ctx.store(),null,2)"></pre>
    </main>
</body>
</html>|]
    where y = convert x

htmlify :: ToJSON p => p -> String
htmlify x = go  (convert . encode $ x) []
  where
    go [] acc     = acc  -- I could have used regexp, bud it isn't the "Haskell way"
    go (a:as) acc = if a == '"' then go as (acc <> "&quot;") else go as (acc <> [a])

setHeaders  :: MonadSnap m => (Streams.OutputStream Builder -> IO ()) -> m ()
setHeaders f = do
  escapeHttp $ \tickle _ writeEnd -> do
    tickle (max (60*60))
    writeStream (WriteBuilder sseHeaders) writeEnd
    f writeEnd

sseHeaders :: Builder
sseHeaders = byteString . convert $ [trimming|
HTTP/1.1 200 OK
server: Snap/1.1.2.1
cache-control: no-cache
connection: keep-alive
Content-type: text/event-stream; charset=utf-8
|] <> "\n\n"

data SSE = SSE {  -- A little data type to decode the store
   frag   :: !String
 , merge  :: !Bool
 , end    :: !Bool
 } deriving Show

datastarSetupFragment :: MonadIO m => SSE -> Streams.OutputStream Builder -> m ()
datastarSetupFragment sse writeEnd = do
  liftIO $ handle handleSSEexception $ do
    writeStream (WriteBuilder "event: datastar-fragment\n") writeEnd
    when (merge sse)
      (writeStream (WriteList ["data: merge upsert_attributes\n"])   writeEnd)
    writeStream    (WriteList ["data: fragment ", frag sse, "\n\n"]) writeEnd
    writeStream Flush writeEnd
    when (end sse) (writeStream Stop writeEnd)
  where
    handleSSEexception :: SomeException -> IO ()
    handleSSEexception e = print e >> throw e

-- A little DSL so I can watch the messages
data SW = Flush | WriteBuilder !Builder | WriteList ![String] | Stop


writeStream :: SW -> Streams.OutputStream Builder -> IO ()
writeStream Flush writeEnd = do
  putStrLn "Flush"
  Streams.write (Just flush) writeEnd
writeStream Stop writeEnd = do
  putStrLn "Stop"
  Streams.write Nothing writeEnd
writeStream (WriteBuilder builder) writeEnd = do
  putStr "WriteBuilder "
  hPutBuilder stdout builder
  Streams.write (Just builder) writeEnd
writeStream (WriteList strs) writeEnd = do
  putStr "WriteList    "
  putStr . mconcat $ strs
  Streams.write (Just (toBuilder strs)) writeEnd
  

decodeDatastar :: Snap Datastar
decodeDatastar = do
  mbBS <- getParam "datastar"
  let
    bs = fromMaybe (error "In decodeDatastar, expected parameter datastar to exits") mbBS
    ds = fromMaybe (error ("bad decoding in decodeDatastar " <> Prelude.show bs)) (decodeStrict bs)
  return ds

handlerGet :: Snap ()
handlerGet = do
  store <- decodeDatastar
  let
    storeInput = input store
    storeOutput = mconcat ["Yout input: ", storeInput, ", is ", Prelude.show . length $ storeInput, " long."]
    newStore = store { output = storeOutput }
    frag1 = mconcat ["<main id=\"main\" data-store=\"", htmlify newStore, "\"></main>" ]
    sse = SSE frag1 True True
  setHeaders (datastarSetupFragment sse)

-- This example is a little silly in haskell because of the lack of string interprolation that
-- is present in javascript.  In the JS example, target is a variable which contains the string
-- "target".  In haskell, while you can do interpolation with template haskell, it is more of
-- a hassle, so I am just using the monoid instance
handlerTarget :: Snap ()
handlerTarget = do
  stamp <- liftIO $ Prelude.show <$> getCurrentTime
  let
    frag1 = mconcat ["<div id=\"", target , "\"><b>", stamp, "</b></div>"]
    sse = SSE frag1 False True
  setHeaders (datastarSetupFragment sse)

handlerFeed :: Snap ()
handlerFeed = do
  liftIO $ putStrLn "enter handlerFeed"
  let
    loop g writeEnd = do
      let
        (str, g') = randomHex g
        msg = mconcat ["<span id=\"feed\">", str, "</span>"]
        sse = SSE msg False False
      datastarSetupFragment sse writeEnd
      liftIO $ threadDelay 1000000 -- Delay for 1 second
      _ <- loop g' writeEnd
      return ()
  setHeaders (loop (mkStdGen 0))
  where
    -- randomR :: RandomGen g => (a, a) -> g -> (a, g)
    -- iterate :: (a -> a) -> a -> [a]
    randomHex ::  RandomGen g => g -> (String,g)
    randomHex g  = (str,newG)
      where
        hex = "0123456789ABCDEF"
        f x = randomR (0,15) (snd x)
        f8 = take 8 . drop 1 $ iterate f (0,g)
        asChar (i,_) = hex !! i
        str = map asChar f8
        newG = snd . last $ f8

toBuilder :: (Convertible a Builder, Monoid a, IsString a) => [a] -> Builder
toBuilder = convert . mconcat

main :: IO ()
main = do
  hSetBuffering stdout NoBuffering
  hSetBuffering stderr NoBuffering
  let
    mbPort = getPort (defaultConfig :: Config Snap a)
    newConfig = setPort (fromMaybe 3000 mbPort) (defaultConfig :: Config Snap a)
  conf <- commandLineConfig newConfig
  print conf
  simpleHttpServe conf site

site :: Snap ()
site =
    ifTop (writeBuilder $ makeIndexPage target) <|>  -- writeBuilder defined in Snap.Core
    route [
        ("favicon.ico" , return ())
      , ("get"         , handlerGet)
      , ("feed"        , handlerFeed)
      , ("target"      , handlerTarget)
      ] <|> (serveDirectory "www")

