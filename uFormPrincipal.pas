unit uFormPrincipal;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.Menus, ufTarefa1, ufTarefa2, ufTarefa3;

type
  TFormPrincipal = class(TForm)
    MainMenuTarefas: TMainMenu;
    arefa11: TMenuItem;
    Tarefa12: TMenuItem;
    arefa21: TMenuItem;
    arefa31: TMenuItem;
    procedure Tarefa12Click(Sender: TObject);
    procedure arefa21Click(Sender: TObject);
    procedure arefa31Click(Sender: TObject);
  private
    { Private declarations }
    procedure CriarFormulario(pFormulario : TFormClass);
  public
    { Public declarations }
  end;

var
  FormPrincipal: TFormPrincipal;

implementation

{$R *.dfm}


procedure TFormPrincipal.arefa21Click(Sender: TObject);
begin
  CriarFormulario(TfTarefa2);
end;

procedure TFormPrincipal.arefa31Click(Sender: TObject);
begin
  CriarFormulario(TfTarefa3);
end;

procedure TFormPrincipal.CriarFormulario(pFormulario: TFormClass);
var vFormulario : TForm;
begin
  vFormulario := pFormulario.Create(Application);
  if vFormulario.ModalResult = mrOk then
    vFormulario.Free;
end;

procedure TFormPrincipal.Tarefa12Click(Sender: TObject);

begin
  CriarFormulario(TfTarefa1);
end;

end.
