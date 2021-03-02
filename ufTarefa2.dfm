object fTarefa2: TfTarefa2
  Left = 0
  Top = 0
  Caption = 'Tarefa 2'
  ClientHeight = 280
  ClientWidth = 589
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  FormStyle = fsMDIChild
  OldCreateOrder = False
  Position = poDesktopCenter
  Visible = True
  OnClose = FormClose
  PixelsPerInch = 96
  TextHeight = 13
  object LabelProcesso1: TLabel
    Left = 88
    Top = 53
    Width = 52
    Height = 13
    Caption = 'Processo 1'
  end
  object LabelProcesso2: TLabel
    Left = 88
    Top = 146
    Width = 52
    Height = 13
    Caption = 'Processo 2'
  end
  object LabelSegundoProgress: TLabel
    Left = 159
    Top = 192
    Width = 172
    Height = 13
    Caption = 'Intervalo de tempo em milisegundos'
  end
  object LabelPrimeiroProgress: TLabel
    Left = 159
    Top = 98
    Width = 172
    Height = 13
    Caption = 'Intervalo de tempo em milisegundos'
  end
  object ProgressBarThread1: TProgressBar
    Left = 88
    Top = 72
    Width = 409
    Height = 17
    Smooth = True
    TabOrder = 0
  end
  object ProgressBarThread2: TProgressBar
    Left = 88
    Top = 165
    Width = 409
    Height = 18
    TabOrder = 1
  end
  object ButtonIniciar: TButton
    Left = 200
    Top = 224
    Width = 179
    Height = 25
    Caption = 'Iniciar'
    TabOrder = 2
    OnClick = ButtonIniciarClick
  end
  object SpinEditSegundosProcessbar1: TSpinEdit
    Left = 88
    Top = 95
    Width = 65
    Height = 22
    MaxValue = 0
    MinValue = 0
    TabOrder = 3
    Value = 0
  end
  object SpinEditSegundosProcessBar2: TSpinEdit
    Left = 88
    Top = 189
    Width = 65
    Height = 22
    MaxValue = 0
    MinValue = 0
    TabOrder = 4
    Value = 0
  end
end
