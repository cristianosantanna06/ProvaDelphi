unit uThreadTarefa2Laco2;

interface

uses
  System.Classes, ComCtrls;

type
  TThreadTarefa2Laco2 = class(TThread)
  Fbarra:TProgressBar;
  FposIni:integer;
  FposFin:integer;
  FposAtual:integer;
  public
    property barra:TProgressBar read Fbarra write Fbarra;
    property posIni:integer read FposIni write FposIni;
    property posFin:integer read FposFin write FposFin;
    property posAtual:integer read FposAtual write FposAtual;
    constructor Create;
    destructor Destroy;
  private
    { Private declarations }
  protected
    procedure Execute; override;
  end;

implementation

{ 
  Important: Methods and properties of objects in visual components can only be
  used in a method called using Synchronize, for example,

      Synchronize(UpdateCaption);  

  and UpdateCaption could look like,

    procedure TThreadTarefa2Laco2.UpdateCaption;
    begin
      Form1.Caption := 'Updated in a thread';
    end; 
    
    or 
    
    Synchronize( 
      procedure 
      begin
        Form1.Caption := 'Updated in thread via an anonymous method' 
      end
      )
    );
    
  where an anonymous method is passed.
  
  Similarly, the developer can call the Queue method with similar parameters as 
  above, instead passing another TThread class as the first parameter, putting
  the calling thread in a queue with the other thread.
    
}

{ TThreadTarefa2Laco2 }

constructor TThreadTarefa2Laco2.Create;
begin

end;

destructor TThreadTarefa2Laco2.Destroy;
begin

end;

procedure TThreadTarefa2Laco2.Execute;
begin
  try
    inherited;
    Fbarra.Min := FposIni;
    Fbarra.Position := FposIni;
    Fbarra.max := FposFin;
    while (Fbarra.Position < FposFin)and not(Terminated) do
    begin
      Fbarra.Position := Fbarra.Position + 1;
    end;
  finally
    self.Terminate;
    self.free;
  end;
end;

end.
