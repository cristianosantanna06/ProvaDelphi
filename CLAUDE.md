# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Delphi (RAD Studio) technical-assessment project ("Prova Delphi"), with identifiers and UI text in Brazilian Portuguese. It is a Windows-only, Win32 VCL application plus a small component package. There is no CLI build, test suite, or linter in the repo: open `ProvaDelphi.groupproj` in the Delphi IDE and build from there (or use `msbuild`/`dcc32` on a Windows machine with Delphi installed). Nothing here can be built or run in the Linux cloud container.

## Architecture

`ProvaDelphi.groupproj` groups three projects:

- **`ProvaDelphiApp`** (`.dpr`): VCL app. `uFormPrincipal` is a main form with a menu; each menu item opens one task form via `CriarFormulario(TFormClass)`:
  - `ufTarefa1`: builds SQL text with `TStringList`s (memo-based UI).
  - `ufTarefa2`: two `TProgressBar`s driven by two `TThread` subclasses (`TThreadProgressBar1/2`, declared in the same unit) that `Sleep` and `Synchronize` UI updates.
  - `ufTarefa3`: `TClientDataSet` + `TDBGrid` of project values; buttons compute a sum and a "total of divisions".
- **`spComponente`** (`.dpk`, runtime-only): defines `TspQuery` (`uspQuery.pas`), a `TFDQuery` descendant (FireDAC/SQLite). It exposes `spColunas`, `spTabelas`, `spCondicoes` string lists, and `GeraSQL` assembles `SELECT ... FROM ... WHERE ... AND ...` into `SQL`. Only one table is allowed (shows a warning and aborts otherwise).
- **`spComponenteDT`** (`.dpk`, design-time-only): registers `TspQuery` on the `spComponentes` palette page via `uspComponentesRegistro.Register`. It must be installed in the IDE for the component to appear. Build `spComponente` first, because the design package builds against its output.

Gotchas:
- `uThreadTarefa2Laco1.pas` and `uThreadTarefa2Laco2.pas` are standalone thread units that are **not** listed in `ProvaDelphiApp.dpr`. The threads actually used by Tarefa2 are the ones declared inside `ufTarefa2.pas`.
- `TspQuery.GeraSQL` shows its warning through FMX dialogs (`FMX.Dialogs`) while the package `requires fmx`, even though the host app is VCL. Keep that in mind before changing the dialog or the package dependencies.
- Source files use legacy Windows-1252 encoding (accented Portuguese strings show as garbled when read as UTF-8). Preserve the encoding when editing and do not re-save as UTF-8.
- Build outputs (`Win32/`, `Bpl/`, `Dcp/`, `Lib/`, `*.exe`, `*.dcu`, `*.res`, `*.identcache`, `*.local`) are committed to git. Expect noisy diffs after a rebuild and avoid committing them unintentionally.
