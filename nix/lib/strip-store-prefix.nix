lib: drv:
let
  p = (
    if (lib.attrsets.isDerivation drv) then
      let
        parts = builtins.filter (x: !builtins.isList x) (
          builtins.split "-" (builtins.baseNameOf drv.outPath)
        );
        name = builtins.concatStringsSep "-" (builtins.tail parts);
      in
      name
    else if (lib.isString drv) then
      builtins.baseNameOf drv
    else
      (throw "derivation or string required")
  );
in
p
