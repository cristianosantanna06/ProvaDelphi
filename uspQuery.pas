unit uspQuery;

interface

uses
  System.SysUtils, System.Classes, Data.DB, FireDAC.Comp.DataSet,
  FireDAC.Comp.Client;

type
  TspQuery = class(TFDQuery)
  private
    { Private declarations }
    GetspCondicoes, GetspColunas, GetspTabelas : TStringList;
    procedure SetspCondicoes(const Value: TStringList);
    procedure SetspColunas(const Value: TStringList);
    procedure SetspTabelas(const Value: TStringList);
  protected
    { Protected declarations }
  public
    { Public declarations }
    procedure GeraSQL;
    constructor Create(AOwner : TComponent); override;
    destructor Destroy; override;
    property spCondicoes: TStringList read GetspCondicoes write SetspCondicoes;
    property spColunas: TStringList read GetspColunas write SetspColunas;
    property spTabelas: TStringList read GetspTabelas write SetspTabelas;
  published
    { Published declarations }

  end;


implementation

uses  FMX.Dialogs, System.UITypes;

{ TspQuery }

constructor TspQuery.Create(AOwner: TComponent);
begin

  inherited ;
  GetspCondicoes := TStringList.Create;
  GetspColunas := TStringList.Create;
  GetspTabelas := TStringList.Create;

end;

destructor TspQuery.Destroy;
begin
  GetspCondicoes.Destroy;
  GetspColunas.Destroy;
  GetspTabelas.Destroy;
  inherited;

end;

procedure TspQuery.GeraSQL;
var vText : TStringList;
    vContador : Integer;
begin
  if (spCondicoes.Count > 0) and (spTabelas.Count > 0) and (spColunas.Count> 0)   then
  begin
    vText := TStringList.Create;
    with vText do
    begin
      for vContador := 0 to spColunas.Count -1 do
      begin
        if vContador = 0 then
          Add('Select '+ spColunas.Strings[vContador])
        else
          Add(','+ spColunas.Strings[vContador]);
      end;
      vContador := 0;

      if spTabelas.Count > 1 then
      begin
        MessageDlg('N�o � permitido inserir mais do que uma tabela!',
           System.UITypes.TMsgDlgType.mtWarning, [
           System.UITypes.TMsgDlgBtn.mbYes], 0,
           System.UITypes.TMsgDlgBtn.mbYes);
        Abort;
      end
      else
        Add('from ' + spTabelas[vContador]);

      for vContador := 0 to spCondicoes.Count -1 do
      begin
        if vContador = 0 then
          Add('where '+ spCondicoes.Strings[vContador])
        else
          Add('  and '+ spCondicoes.Strings[vContador]);
      end;
      if vText.Count > 0 then
        SQL.Text := vtext.Text;
    end;
    vText.Destroy;
  end
  else
    SQL.Clear;
end;

procedure TspQuery.SetspColunas(const Value: TStringList);
begin
  GetspColunas.Assign(value);
end;

procedure TspQuery.SetspCondicoes(const Value: TStringList);
begin
  GetspCondicoes.Assign(value);
end;

procedure TspQuery.SetspTabelas(const Value: TStringList);
begin
  GetspTabelas.Assign(value);
end;


end.
