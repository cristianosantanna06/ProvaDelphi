unit ufTarefa1;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, FireDAC.Stan.Intf,
  FireDAC.Stan.Option, FireDAC.Stan.Param, FireDAC.Stan.Error, FireDAC.DatS,
  FireDAC.Phys.Intf, FireDAC.DApt.Intf, FireDAC.Stan.Async, FireDAC.DApt,
  Data.DB, FireDAC.Comp.DataSet, FireDAC.Comp.Client, uspQuery, FireDAC.UI.Intf,
  FireDAC.Stan.Def, FireDAC.Stan.Pool, FireDAC.Phys, FireDAC.VCLUI.Wait;

type
  TfTarefa1 = class(TForm)
    MemoColuna: TMemo;
    MemoSql: TMemo;
    MemoTabela: TMemo;
    MemoCondicao: TMemo;
    ButtonGerar: TButton;
    spQuerySql: TspQuery;
    LabelColunas: TLabel;
    LabelTabelas: TLabel;
    LabelCondicoes: TLabel;
    LabelSQL: TLabel;
    FDConnectionSp: TFDConnection;
    FDTransactionSp: TFDTransaction;
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure ButtonGerarClick(Sender: TObject);
    procedure AdicionaTexto(pNomeStringlist : TStringList; pMemo : TMemo);
  private
    { Private declarations }
  public
    { Public declarations }
  end;


implementation

{$R *.dfm}

procedure TfTarefa1.AdicionaTexto(pNomeStringlist: TStringList; pMemo: TMemo);
var vContador : integer;
    vTexto : string;
begin
  pNomeStringlist.Clear;
  for vContador := 0 to pMemo.Lines.Count -1 do
  begin
    vTexto := trim(pMemo.Lines[vContador]);
    // n�o insere texto em branco
    if vTexto <> '' then
      pNomeStringlist.Add(vTexto);
  end;

end;

procedure TfTarefa1.ButtonGerarClick(Sender: TObject);

begin
  with  spQuerySql do
  begin
//  adcionada dados colunas
    AdicionaTexto(spColunas, MemoColuna);
//  adcionada dados tabela
    AdicionaTexto(spTabelas, MemoTabela);
//  adcionada dados condicoes
    AdicionaTexto(spCondicoes, MemoCondicao);
//  Gera o Sql automatico
    GeraSQL;
    MemoSql.Text := SQL.Text;
  end;
end;

procedure TfTarefa1.FormClose(Sender: TObject; var Action: TCloseAction);
begin
  ModalResult := mrOk;
  Destroy;
end;

end.
