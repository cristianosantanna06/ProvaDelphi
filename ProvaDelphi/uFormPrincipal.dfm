object FormPrincipal: TFormPrincipal
  Left = 0
  Top = 0
  Caption = 'Principal'
  ClientHeight = 524
  ClientWidth = 801
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  FormStyle = fsMDIForm
  Menu = MainMenuTarefas
  OldCreateOrder = False
  Position = poDesktopCenter
  PixelsPerInch = 96
  TextHeight = 13
  object MainMenuTarefas: TMainMenu
    Left = 304
    Top = 256
    object arefa11: TMenuItem
      Caption = 'Tarefas'
      object Tarefa12: TMenuItem
        Caption = 'Tarefa 1'
        OnClick = Tarefa12Click
      end
      object arefa21: TMenuItem
        Caption = 'Tarefa 2'
        OnClick = arefa21Click
      end
      object arefa31: TMenuItem
        Caption = 'Tarefa 3'
        OnClick = arefa31Click
      end
    end
  end
end
