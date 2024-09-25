let
  sources = import ./nix/npins;
in
{
  pkgs ? import sources.nixpkgs { },
  buildGoCache ? pkgs.callPackage "${sources.build-go-cache}/buildGoCache.nix" {
    buildGoModule = pkgs.buildGo123Module;
  },
}:
let
  package = builtins.fromJSON (builtins.readFile ./packages/library/package.json);
  site-bin = pkgs.callPackage ./nix/pkgs/datastar.nix {
    datastarVer = package.version;
    inherit buildGoCache;
  };
in
site-bin
