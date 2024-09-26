{
  lib,
  buildGo123Module,
  nodejs-slim_20,
  pnpm,
  stdenvNoCC,
  templ,
  datastarVer ? "1.18.5",
  buildGoCache ? null,
  ...
}:
let
  gitrepo = lib.fileset.gitTracked ../../.;
  root = ../../.;
  src = lib.fileset.toSource {
    inherit root;
    fileset = gitrepo;
  };
  version = datastarVer;
  node' = nodejs-slim_20;

  backend-static-dir = "./backends/go/site/static";
  tailwindcss-dest = "${backend-static-dir}/css/site.css";

  pnpmDeps = pnpm.fetchDeps {
    pname = "datastar-workspace";
    inherit version;
    src = lib.fileset.toSource {
      inherit root;
      fileset = lib.fileset.unions [
        (lib.fileset.intersection (root + "/backends/go/site/css") gitrepo)
        (lib.fileset.intersection (root + "/packages") gitrepo)
        (root + "/pnpm-lock.yaml")
        (root + "/pnpm-workspace.yaml")
      ];
    };
    hash = "sha256-IUessi5Gsws0i/KQvy0FsGMsFqDO1SlM04NsbM31Nuw=";
  };

  vendorHash = "sha256-i7+Wn0eN6kBMt2VWPMdgGkcXuIxkOREN8ScDSpBJtDE=";
  proxyVendor = true;
  goCache = lib.optional (buildGoCache != null) (buildGoCache {
    importPackagesFile = ./imported-packages;
    inherit src proxyVendor vendorHash;
  });
  datastar-backends = {
    go = buildGo123Module {
      inherit
        version
        proxyVendor
        vendorHash
        ;
      src = lib.fileset.toSource {
        inherit root;
        fileset = lib.fileset.unions [
          (lib.fileset.intersection (root + "/backends/go") gitrepo)
          (root + "/go.mod")
          (root + "/go.sum")
          (lib.fileset.fromSource (lib.sources.sourceFilesBySuffices root [ ".go" ]))
        ];
      };
      pname = "datastar-site-go";
      subPackages = [ "backends/go/cmd/site" ];
      # IFD, but it's ok since we are not in nixpkgs
      preBuild = ''
        cp ${datastar-tailwind-step} ${tailwindcss-dest}
        cp -r ${datastar-library} ${backend-static-dir}/library
        cp -r ${datastar-inspector} ${backend-static-dir}/inspector
        TEMPL_EXPERIMENT=rawgo templ generate .
      '';
      postInstall = "mv $out/bin/site $out/bin/site_bin";
      CGO_ENABLED = 0;
      ldflags = [
        "-s"
        "-extldflags '-static'"
      ];
      buildInputs = goCache;
      nativeBuildInputs = [ templ ];
      doCheck = false; # no tests
    };
    # TODO haskell, node backends
    haskell = { };
    node = { };
  };

  mkPnpmDerivation =
    {
      name,
      buildDir,
      buildCmd,
      installCmds,
      fileset,
    }:
    stdenvNoCC.mkDerivation {
      inherit name pnpmDeps;
      src = lib.fileset.toSource { inherit root fileset; };
      nativeBuildInputs = [
        node'
        pnpm.configHook
      ];
      postBuild = ''
        pushd ${buildDir}
        ${buildCmd}
        popd
      '';
      installPhase = ''
        runHook preInstall
        ${installCmds}
        runHook postInstall
      '';
    };

  datastar-tailwind-step = mkPnpmDerivation {
    name = "datastar-tailwind-static-css";
    buildDir = "backends/go/site/css";
    buildCmd = "pnpm tailwindcss build -o ../static/css/site.css";
    installCmds = "cp ${tailwindcss-dest} $out";
    fileset = lib.fileset.unions [
      (lib.fileset.intersection (root + "/backends/go") gitrepo)
      (root + "/pnpm-lock.yaml")
      (root + "/pnpm-workspace.yaml")
    ];
  };

  datastar-library = mkPnpmDerivation rec {
    name = "datastar-jslib";
    buildDir = "packages/library";
    buildCmd = "pnpm build";
    installCmds = ''
      cp -r ${buildDir}/dist $out
      cp ${buildDir}/package.json $out
    '';
    fileset = lib.fileset.unions [
      (lib.fileset.intersection (root + "/packages/library") gitrepo)
      (root + "/pnpm-lock.yaml")
      (root + "/pnpm-workspace.yaml")
    ];
  };

  datastar-inspector = mkPnpmDerivation rec {
    name = "datastar-inspector";
    buildDir = "packages/inspector";
    # TODO is there a better way? nativeBuildInputs/pnpmWorkspace?
    buildCmd = ''
      cp -r ${datastar-library} node_modules/@sudodevnull/datastar/dist
      pnpm build
    '';
    installCmds = ''
      cp -r ${buildDir}/dist $out
      cp ${buildDir}/package.json $out
    '';
    fileset = lib.fileset.unions [
      (lib.fileset.intersection (root + "/packages/inspector") gitrepo)
      (lib.fileset.intersection (root + "/packages/library") gitrepo)
      (root + "/pnpm-lock.yaml")
      (root + "/pnpm-workspace.yaml")
    ];
  };

in
datastar-backends.go
