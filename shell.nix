let
  sources = import ./nix/npins;
  pkgs = import sources.nixpkgs { };
  inherit (pkgs) lib;
  stripStorePrefix = import ./nix/lib/strip-store-prefix.nix lib;
  toplevel = "$(git rev-parse --show-toplevel)";
  run-site-bin-nix = pkgs.writeScriptBin "run-site-bin-nix" ''
    $(nix-build ${toplevel})/bin/site_bin
  '';
  build-site-bin-nix = pkgs.writeScriptBin "build-site-bin-nix" ''
    nix-build ${toplevel} --log-format internal-json 2>&1| nom --json
  '';
  playwright-run-ui = pkgs.writeScriptBin "playwright-run-ui" ''
    cd ${toplevel}/packages/playwright
    pnpm i
    pnpm playwright test --ui
  '';
  playwright-run-ci = pkgs.writeScriptBin "playwright-run-ci" ''
    cd ${toplevel}/packages/playwright
    pnpm i
    pnpm playwright test 2>/dev/null
  '';
  custom_scripts = [
    build-site-bin-nix
    run-site-bin-nix
    playwright-run-ui
    playwright-run-ci
  ];
  nix_tools = with pkgs; [
    nixfmt-rfc-style
    npins
    nix-output-monitor
    deadnix
  ];
  script_names = builtins.map stripStorePrefix (
    custom_scripts ++ (lib.map lib.meta.getExe nix_tools)
  );
  scripts = builtins.concatStringsSep " " script_names;
  menu = pkgs.writeScriptBin "menu" ''
    task -a
    echo -en "${"\n"}-- nix specific --${"\n\n"}"
    echo "menu:${"\t\t"}   prints this list of commands"
    echo ${scripts} | tr ' ' '\n'
  '';
in
pkgs.mkShellNoCC {
  env = {
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
  };

  shellHook = ''
    git lfs install --local
    git lfs fetch
    git lfs checkout

    ${menu}/bin/menu
  '';

  packages =
    with pkgs;
    [
      git-lfs
      go
      go-task
      templ

      killall
      pnpm
      nodejs-slim_20
    ]
    ++ nix_tools
    ++ custom_scripts
    ++ [ menu ];
}
