object fTarefa1: TfTarefa1
  Left = 0
  Top = 0
  Caption = 'Tarefa 1'
  ClientHeight = 434
  ClientWidth = 718
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
  object LabelColunas: TLabel
    Left = 56
    Top = 45
    Width = 38
    Height = 13
    Caption = 'Colunas'
  end
  object LabelTabelas: TLabel
    Left = 248
    Top = 45
    Width = 37
    Height = 13
    Caption = 'Tabelas'
  end
  object LabelCondicoes: TLabel
    Left = 440
    Top = 45
    Width = 49
    Height = 13
    Caption = 'Condi'#231'oes'
  end
  object LabelSQL: TLabel
    Left = 56
    Top = 261
    Width = 57
    Height = 13
    Caption = 'SQL Gerado'
  end
  object MemoColuna: TMemo
    Left = 56
    Top = 64
    Width = 169
    Height = 177
    TabOrder = 0
  end
  object MemoSql: TMemo
    Left = 56
    Top = 280
    Width = 553
    Height = 137
    TabStop = False
    ReadOnly = True
    TabOrder = 4
  end
  object MemoTabela: TMemo
    Left = 248
    Top = 64
    Width = 169
    Height = 177
    TabOrder = 1
  end
  object MemoCondicao: TMemo
    Left = 440
    Top = 64
    Width = 169
    Height = 177
    TabOrder = 2
  end
  object ButtonGerar: TButton
    Left = 615
    Top = 144
    Width = 81
    Height = 25
    Caption = 'Gerar SQL'
    TabOrder = 3
    OnClick = ButtonGerarClick
  end
  object spQuerySql: TspQuery
    Connection = FDConnectionSp
    Transaction = FDTransactionSp
    Left = 640
    Top = 264
  end
  object FDConnectionSp: TFDConnection
    Transaction = FDTransactionSp
    Left = 640
    Top = 16
  end
  object FDTransactionSp: TFDTransaction
    Connection = FDConnectionSp
    Left = 640
    Top = 64
  end
end
