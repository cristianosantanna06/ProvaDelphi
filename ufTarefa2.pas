unit ufTarefa2;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, Vcl.ComCtrls, Vcl.Mask,
  Vcl.WinXPickers, Vcl.Samples.Spin;

type
  TfTarefa2 = class(TForm)
    ProgressBarThread1: TProgressBar;
    ProgressBarThread2: TProgressBar;
    ButtonIniciar: TButton;
    LabelProcesso1: TLabel;
    LabelProcesso2: TLabel;
    SpinEditSegundosProcessbar1: TSpinEdit;
    SpinEditSegundosProcessBar2: TSpinEdit;
    LabelSegundoProgress: TLabel;
    LabelPrimeiroProgress: TLabel;
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure ButtonIniciarClick(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

  TThreadProgressBar1 = class(TThread)
  private
    FProgressBar : TProgressBar;
    FTempoProgressBar1 : Integer;
  protected
     procedure Execute;override;
  public
    property BarraProgresso1: TProgressBar read FProgressBar write FProgressBar;
    constructor Create(CreateSuspended: Boolean; pProgressbar: TProgressBar; pTempo : integer); overload;
  end;

  TThreadProgressBar2 = class(TThread)
  private
    FProgressBar2 : TProgressBar;
    FTempoProgressBar2 : Integer;
  protected
     procedure Execute;override;
  public
    property BarraProgresso2:TProgressBar read FProgressBar2 write FProgressBar2;
    constructor Create(CreateSuspended: Boolean; pProgressbar: TProgressBar; pTempo : integer); overload;
  end;

var
  fTarefa2: TfTarefa2;



implementation

{$R *.dfm}


procedure TfTarefa2.ButtonIniciarClick(Sender: TObject);
var vThreadBarra1 : TThreadProgressBar1;
    vThreadBarra2 : TThreadProgressBar2;
begin

// Carrega a primeira Barra de Progresso
  vThreadBarra1 := TThreadProgressBar1.Create(True, ProgressBarThread1, SpinEditSegundosProcessbar1.Value);
  VThreadBarra1.Start;
// Carrega a segunda Barra de Progresso
  vThreadBarra2 := TThreadProgressBar2.Create(True, ProgressBarThread2, SpinEditSegundosProcessbar2.Value);
  vThreadBarra2.Start;

end;

procedure TfTarefa2.FormClose(Sender: TObject; var Action: TCloseAction);
begin

  Destroy;
end;


constructor TThreadProgressBar1.Create(CreateSuspended: Boolean;
  pProgressbar: TProgressBar; pTempo : integer);
begin
  inherited Create(CreateSuspended);
  Self.FProgressBar := pProgressbar;
  Self.FTempoProgressBar1 := pTempo;
  FreeOnTerminate := True;
end;

procedure TThreadProgressBar1.Execute;
var i : integer;
begin
  try
    inherited;
    FProgressBar.Min := 0;
    FProgressBar.Position := 0;
    FProgressBar.max := 100;
    //Aguarda Antes comecar

    if not Terminated then
    begin
      for I := 0 to 100 do
      begin
        Sleep(FTempoProgressBar1);
        FProgressBar.Position := i;
      end;
    end;


  finally
    Self.Terminate;
    Self.free;
  end;

end;

{ TThreadProgressBar2 }

constructor TThreadProgressBar2.Create(CreateSuspended: Boolean;
  pProgressbar: TProgressBar; pTempo: integer);
begin
  inherited Create(CreateSuspended);
  Self.FProgressBar2 := pProgressbar;
  Self.FTempoProgressBar2 := pTempo;
  FreeOnTerminate := True;
end;

procedure TThreadProgressBar2.Execute;
var i : integer;
begin
  try
    inherited;
    FProgressBar2.Min := 0;
    FProgressBar2.Position := 0;
    FProgressBar2.max := 100;

    if not Terminated then
    begin
      for I := 0 to 100 do
      begin
        Sleep(FTempoProgressBar2);
        FProgressBar2.Position := i;
      end;
    end;


  finally
    Self.Terminate;
    Self.free;
  end;

end;

end.
