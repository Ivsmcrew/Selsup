import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dispatch, SetStateAction } from "react"
import { FC, useEffect, useState } from "react"
import styles from './index.module.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function App() {
  return (
    <div>
      <ParamEditor />
    </div>
  )
}

//___________________________components
interface CreatePanelProps {
  params: IParam[],
  setParams: Dispatch<SetStateAction<IParam[]>>,
  model: IModel,
  setModel: Dispatch<SetStateAction<IModel>>
}

interface IPanelData {
  id: number | string,
  name: string,
  value: string
}

const CreatePanel:FC<CreatePanelProps> = ({params, setParams, model, setModel}) => {
  const [panelData, setPanelData] = useState<IPanelData>({
    id: '',
    name: '',
    value: ''
  })

  function checkData() {
    let isDataValid = true
    params.forEach((item) => {
      if (item.id == panelData.id) {
        isDataValid = false
      }
    })
    return isDataValid
  }
  function handleButton() {
    if (panelData.id && panelData.name && panelData.value && checkData()) {
      setParams([...params, {id: panelData.id, name: panelData.name}])
      setModel({'paramValues': [
        ...model.paramValues, {paramId: panelData.id, value: panelData.value}
      ]})
      setPanelData({
        id: '',
        name: '',
        value: ''
      })
    }
  }

  return (
    <>
    <h4>CREATE A NEW PARAMETER</h4>
      <div>
        <label className={styles.label}>
          <span className={styles.paramName}>Param ID</span> 
          <input 
            className={styles.paramValue}
            value={panelData.id}
            onChange={(e) => {setPanelData({...panelData, id: e.target.value})}}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.paramName}>Param name</span> 
          <input 
            className={styles.paramValue}
            value={panelData.name}
            onChange={(e) => {setPanelData({...panelData, name: e.target.value})}}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.paramName}>Param value</span> 
          <input 
            className={styles.paramValue}
            value={panelData.value}
            onChange={(e) => {setPanelData({...panelData, value: e.target.value})}}
          />
        </label>
      </div>
      <button 
        className={styles.createButton}
        onClick={handleButton}
      >
        CREATE
      </button>
    </>
  )
}

const ParamEditor:FC = () => {
  const [params, setParams] = useState<IParam[]>(
    [
      {id: 1, name: `Назначение`},
      {id: 2, name: `Длина`},
      {id: 3, name: `Цвет`},
    ]
  );
  const [model, setModel] = useState<IModel>(
    {
      'paramValues': [
        {'paramId': 1, 'value': 'повседневное'},
        {'paramId': 2, 'value': 'короткий'},
        {'paramId': 3, 'value': 'красный'},
      ]
    }
  );
  const [tableState, setTableState] = useState<ITableState | null>(null); 

  function getModel():IModel {
    return model
  }
  function refreshTable():void {
    setTableState({
      params: params,
      model: model
    })
  }

  return (
    <div className={styles.paramEditor}>
      <CreatePanel 
        params={params} 
        setParams={setParams} 
        model={model}
        setModel={setModel} 
      />

      <ParamsList
        params={params} 
        setParams={setParams} 
        model={model}
        setModel={setModel} 
      />

      <button 
        className={styles.refreshButton}
        onClick={refreshTable}
      >
        PRINT MODEL
      </button>

      {tableState ?
      <Table tableState={tableState} /> :
      <span className={styles.printTitle}>Print it!</span>
      }
    </div>
  )
}

export interface ParamsListProps {
  params: IParam[],
  setParams: Dispatch<SetStateAction<IParam[]>>
  model: IModel,
  setModel: Dispatch<SetStateAction<IModel>>
}
const ParamsList:FC<ParamsListProps> = ({params, setParams, model, setModel}) => {
  function getInputValueById(id:number | string): IParamValue {
    let paramValue = model.paramValues.find(paramValue => paramValue.paramId === id)
 
    return paramValue ? paramValue : {paramId: -1, value: ''}
  }

  return(
    <>
      <h4>LIST OF ACTIVE PARAMETERS</h4>
      {params.map(param => {
        return(
          <label key={param.id} className={styles.label}>
            <span className={styles.paramName}>{param.name}</span> 
            <UniInput 
              startValue={getInputValueById(param.id).value} 
              effectFunc={(value) => {
                setModel({
                  'paramValues': getNewParamValues(model, getInputValueById(param.id), value)
                })
              }}
            />
            <button 
              onClick={() => deleteFromModel(param, model, setModel, params, setParams)}
              className={styles.deleteButton}
            >
              Delete
            </button> 
          </label>
        )
      })}
    </>
  )
}

export interface TableProps {
  tableState: ITableState
}
const Table:FC<TableProps> = ({tableState}) => {
  const [tableParams, setTableParams] = useState<IParam[]>([])
  const [paramValues, setParamValues] = useState<IParamValue[]>([])

  useEffect(() => {
    if (tableState) {
      setTableParams(tableState.params)
      setParamValues(tableState.model.paramValues)
    }
  }, [tableState])

  function isDataReady() {
    if (tableParams && paramValues) {
      return true
    } else {
      return false
    }
  }

  return (
    isDataReady() 
      ?
      <table className={styles.table}>
        <caption className={styles.caption}>
          <h4>TABLE OF OUR MODEL</h4>
        </caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>PARAM</th>
            <th>VALUE</th>
          </tr>
        </thead>
        <tbody>
          {tableParams.map((tableParam) => {
            return(
              <tr key={tableParam.id} className={styles.tr}>
                <td className={styles.td}>{tableParam.id}</td>
                <td className={styles.td}>{tableParam.name}</td>
                <td className={styles.td}>{paramValues.find(item => item.paramId === tableParam.id)?.value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      :
      null
  )
}

export interface UniInputProps {
  startValue: string,
  effectFunc: (value:string) => void
}

const UniInput:FC<UniInputProps> = ({startValue, effectFunc}) => {
  const [value, setValue] = useState(startValue);

  useEffect(() => {
    effectFunc(value)
  }, [value])

  function inputHandler(e:React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }

  return (
    <input 
      className={styles.paramValue} 
      type="text" 
      value={value} 
      onChange={inputHandler}
    />
  )
}

//___________________________main interfaces
interface IParamValue {
  paramId: number | string,
  value: string
}

interface IModel {
  paramValues: IParamValue[]
}

interface IParam {
  id: number | string,
  name: string 
}

interface ITableState {
  params: IParam[],
  model: IModel
}


//___________________________utils functions
type TypeGetNewParamValues = (
                              model: IModel, 
                              updatingParamValue: IParamValue, 
                              newValue: string
                             ) => IParamValue[] 
const getNewParamValues: TypeGetNewParamValues = (model, updatingParamValue, newValue) => {
  return model.paramValues.map((item) => {
    if (item.paramId === updatingParamValue.paramId) {
      return {'paramId': updatingParamValue.paramId, 'value': newValue}
    } else {
      return item
    }
  })
}

type TypeDeleteFromModel = (
                            param: IParam,
                            model: IModel,
                            setModel: Dispatch<SetStateAction<IModel>>,
                            params: IParam[],
                            setParams: Dispatch<SetStateAction<IParam[]>>
                           ) => void
const deleteFromModel: TypeDeleteFromModel = (param, model, setModel, params, setParams) => { 
  const newParamValues:IParamValue[] = [];
  model.paramValues.forEach((item) => {
    if (item.paramId !== param.id) {
      newParamValues.push(item)
    } 
  })
  setModel({
    'paramValues': newParamValues
  })

  const newParams:IParam[] = [];
  params.forEach((item) => {
    if (item.id !== param.id) {
      newParams.push(item)
    }
  })
  setParams(newParams)
}