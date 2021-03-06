unit ufTarefa3;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Data.DB, Datasnap.DBClient, Vcl.Grids,
  Vcl.DBGrids, Vcl.StdCtrls;

type
  TfTarefa3 = class(TForm)
    DBGrid1: TDBGrid;
    ClientDataSetValores: TClientDataSet;
    DataSourceValores: TDataSource;
    ClientDataSetValoresidProjeto: TIntegerField;
    ClientDataSetValoresNomeProjeto: TStringField;
    ClientDataSetValoresValor: TFloatField;
    LabelValoresPorProjeto: TLabel;
    ButtonObterTotal: TButton;
    ButtonObterTotalDivisoes: TButton;
    EditValorTotal: TEdit;
    EditTotalDivisoes: TEdit;
    LabelTotal: TLabel;
    LabelTotalDivisoes: TLabel;
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure FormCreate(Sender: TObject);
    function SomaValores : Double;
    function TotalDivisoes : Double;
    procedure ButtonObterTotalClick(Sender: TObject);
    procedure ButtonObterTotalDivisoesClick(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

var
  fTarefa3: TfTarefa3;

implementation

{$R *.dfm}

procedure TfTarefa3.ButtonObterTotalClick(Sender: TObject);
begin
  EditValorTotal.Text := FormatFloat('R$ 0.00', SomaValores);
end;

procedure TfTarefa3.ButtonObterTotalDivisoesClick(Sender: TObject);
begin
  EditTotalDivisoes.Text := FormatFloat('R$ 0.00', TotalDivisoes);
end;

procedure TfTarefa3.FormClose(Sender: TObject; var Action: TCloseAction);
begin
  ClientDataSetValores.EmptyDataSet;
  ClientDataSetValores.Close;
  ClientDataSetValores.Destroy;
  Destroy;
end;

procedure TfTarefa3.FormCreate(Sender: TObject);
var i : integer;
begin
  with ClientDataSetValores do
  begin
    CreateDataSet;
    //popular dataset
    for I := 0 to 10 - 1  do
    begin
      Append;
      FieldByName('idProjeto').AsInteger := i + 1;
      FieldByName('NomeProjeto').AsString := 'Projeto ' + IntToStr(i + 1);
      FieldByName('Valor').AsFloat := (i + 1) * 10;
      Post;

    end;

  end;
end;

function TfTarefa3.SomaValores : Double;
var vSoma : Double;
begin
  vSoma := 0;
  with ClientDataSetValores do
  begin
    First;
    while not Eof do
    begin
      vSoma := vSoma + FieldByName('Valor').AsFloat;
      Next;
    end;
    Result := vSoma;
  end;
end;

function TfTarefa3.TotalDivisoes: Double;
var vValorAnterior, vValorProximo, vAuxDivisao, vResultDivisao: Double;
begin
//registro anterior e atribuir no edit �Total divis�es R$�. Ex:
//o Projeto 1 = 10,00 | Projeto 2 = 20,00 | Projeto3 = 30,00
//o (20 / 10) = 2
//o (30 / 20) = 1,5
//o Total a ser exibido em �Total
  with ClientDataSetValores do
  begin
    First;
    vValorProximo:= -1;
    vValorAnterior:= -1;;
    vResultDivisao := 0;
    while not Eof do
    begin
      vAuxDivisao := 0;
      if vValorProximo > -1 then
      begin
        vValorProximo := FieldByName('Valor').AsFloat;
        if vValorProximo > 0 then
          vAuxDivisao := vValorProximo / vValorAnterior;
      end
      else
        vValorProximo := FieldByName('Valor').AsFloat;

      vValorAnterior := vValorProximo;
      if vAuxDivisao > 0 then
        vResultDivisao := vResultDivisao + vAuxDivisao;
      Next;
    end;
    Result := vResultDivisao;
  end;


end;

end.
