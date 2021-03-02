unit uThreadTarefa2Laco1;

interface

uses
  System.Classes, ComCtrls;

type
  TThreadTarefa2Laco1 = class(TThread)
  private
    { Private declarations }
//    FProgressBarInteracao1: TProgressBar;
    fVariavelContador: integer;
    procedure StatusBarraProgresso1;
  protected
    procedure Execute; override;
  end;

implementation

uses ufTarefa2;

{uses
  Important: Methods and properties of objects in visual components can only be
  used in a method called using Synchronize, for example,

      Synchronize(UpdateCaption);  

  and UpdateCaption could look like,

    procedure TThreadTarefa2Laco1.UpdateCaption;
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

{ TThreadTarefa2Laco1 }

procedure TThreadTarefa2Laco1.Execute;
var i: integer;
begin
  if not Terminated then
  begin
    for i := 0 to 100 do
    begin
      Self.fVariavelContador := i;
      Synchronize(StatusBarraProgresso1);
    end;
  end;
end;

procedure TThreadTarefa2Laco1.StatusBarraProgresso1;
begin
  fTarefa2.ProgressBarThread1.Position := Self.fVariavelContador;
end;

end.
