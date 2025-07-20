import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
  } from 'mobx';
  
  type PrivateFields =
    | '_socket'
    | '_connectionStatus'
    | '_lastData'
    | '_radius';
  
  type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
  
  export default class CameraStore {
    private _socket: WebSocket | null = null;
    private _connectionStatus: ConnectionStatus = 'disconnected';
    private _lastData: any = null;
    private _radius = 10;
    private readonly _dataCallback: (data: any) => void;
  
    constructor(wsUrl: string, dataCallback: (data: any) => void) {
      this._dataCallback = dataCallback;
      makeObservable<CameraStore, PrivateFields>(this, {
        _socket: observable.ref,
        _connectionStatus: observable.ref,
        _lastData: observable,
        _radius: observable,
        connectionStatus: computed,
        lastData: computed,
        radius: computed,
        setRadius: action,
      });
      this.connect(wsUrl);
    }
  
    get connectionStatus(): ConnectionStatus {
      return this._connectionStatus;
    }
  
    get lastData() {
      return this._lastData;
    }
  
    get radius() {
      return this._radius;
    }
  
    setRadius(radius: number) {
      this._radius = radius;
      if (this._socket && this._connectionStatus === 'connected') {
        this._socket.send(JSON.stringify({ radius }));
      }
    }
  
    private connect(wsUrl: string) {
      this._connectionStatus = 'connecting';
  
      const socket = new WebSocket(wsUrl);
  
      socket.addEventListener('open', () => {
        runInAction(() => {
          this._socket = socket;
          this._connectionStatus = 'connected';
          // Отправляем текущий радиус при подключении
          this._socket.send(JSON.stringify({ radius: this._radius }));
        });
      });
  
      socket.addEventListener('close', () => {
        runInAction(() => {
          this._socket = null;
          this._connectionStatus = 'disconnected';
        });
        // Переподключение через 5 секунд
        setTimeout(() => this.connect(wsUrl), 5000);
      });
  
      socket.addEventListener('error', () => {
        runInAction(() => {
          this._socket = null;
          this._connectionStatus = 'disconnected';
        });
      });
  
      socket.addEventListener('message', (evt) => {
        try {
          const data = JSON.parse(evt.data);
          runInAction(() => {
            this._lastData = data;
          });
          this._dataCallback(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      });
    }
  }