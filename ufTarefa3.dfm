object fTarefa3: TfTarefa3
  Left = 0
  Top = 0
  Caption = 'Tarefa 3'
  ClientHeight = 472
  ClientWidth = 752
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
  OnCreate = FormCreate
  PixelsPerInch = 96
  TextHeight = 13
  object LabelValoresPorProjeto: TLabel
    Left = 16
    Top = 21
    Width = 99
    Height = 13
    Caption = 'Valores por Projeto :'
  end
  object LabelTotal: TLabel
    Left = 625
    Top = 370
    Width = 40
    Height = 13
    Caption = 'Total R$'
  end
  object LabelTotalDivisoes: TLabel
    Left = 625
    Top = 416
    Width = 82
    Height = 13
    Caption = 'Total Divis'#245'es R$'
  end
  object DBGrid1: TDBGrid
    Left = 8
    Top = 40
    Width = 713
    Height = 321
    DataSource = DataSourceValores
    TabOrder = 0
    TitleFont.Charset = DEFAULT_CHARSET
    TitleFont.Color = clWindowText
    TitleFont.Height = -11
    TitleFont.Name = 'Tahoma'
    TitleFont.Style = []
    Columns = <
      item
        Expanded = False
        FieldName = 'idProjeto'
        Visible = True
      end
      item
        Expanded = False
        FieldName = 'NomeProjeto'
        Visible = True
      end
      item
        Expanded = False
        FieldName = 'Valor'
        Visible = True
      end>
  end
  object ButtonObterTotal: TButton
    Left = 488
    Top = 387
    Width = 113
    Height = 25
    Caption = 'Obter Total'
    TabOrder = 1
    OnClick = ButtonObterTotalClick
  end
  object ButtonObterTotalDivisoes: TButton
    Left = 488
    Top = 433
    Width = 113
    Height = 25
    Caption = 'Obter total Divis'#245'es'
    TabOrder = 2
    OnClick = ButtonObterTotalDivisoesClick
  end
  object EditValorTotal: TEdit
    Left = 625
    Top = 389
    Width = 104
    Height = 21
    TabOrder = 3
  end
  object EditTotalDivisoes: TEdit
    Left = 625
    Top = 435
    Width = 104
    Height = 21
    TabOrder = 4
  end
  object ClientDataSetValores: TClientDataSet
    Aggregates = <>
    Params = <>
    Left = 464
    Top = 56
    object ClientDataSetValoresidProjeto: TIntegerField
      FieldName = 'idProjeto'
    end
    object ClientDataSetValoresNomeProjeto: TStringField
      FieldName = 'NomeProjeto'
    end
    object ClientDataSetValoresValor: TFloatField
      FieldName = 'Valor'
      DisplayFormat = 'R$0.00'
      EditFormat = '#0.00'
    end
  end
  object DataSourceValores: TDataSource
    DataSet = ClientDataSetValores
    Left = 464
    Top = 120
  end
end
