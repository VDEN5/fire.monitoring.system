import {
  normalizeDetection,
  type DetectionModel,
} from '@store/models/Detection';
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
  | '_detections'
  | '_radius'
  | '_radiusSentMessageVisible'
  | '_form';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

const LIMIT_FOR_RELOAD = 100;
const WEBOSKET_SERVER = 'ws://localhost:8000';

export default class MainStore {
  private _socket: WebSocket | null = null;
  private _connectionStatus: ConnectionStatus = 'disconnected';
  private _detections: DetectionModel[] = [];
  private _radius = 10;
  private _radiusSentMessageVisible = false;
  private _form = {
    radius: '',
  };

  constructor() {
    makeObservable<MainStore, PrivateFields>(this, {
      _form: observable,
      form: computed,
      _radiusSentMessageVisible: observable,
      _radius: observable,
      _socket: observable.ref,
      _connectionStatus: observable.ref,
      _detections: observable,
      detections: computed,
      connectionStatus: computed,
      radius: computed,
      connect: action,
      setRadius: action,
    });
    this.connect();
  }

  get connectionStatus(): ConnectionStatus {
    return this._connectionStatus;
  }

  get detections() {
    return this._detections;
  }

  get radius() {
    return this._radius;
  }

  get form() {
    return this._form;
  }

  get radiusSentMessageVisible() {
    return this._radiusSentMessageVisible;
  }

  setRadius(val: string) {
    this._form.radius = val;
  }

  connect() {
    this._connectionStatus = 'connecting';

    const socket = new WebSocket(WEBOSKET_SERVER);

    socket.addEventListener('open', () => {
      runInAction(() => {
        this._socket = socket;
        this._connectionStatus = 'connected';
      });
    });

    socket.addEventListener('close', () => {
      runInAction(() => {
        this._socket = null;
        this._connectionStatus = 'disconnected';
      });
    });

    socket.addEventListener('error', () => {
      runInAction(() => {
        this._socket = null;
        this._connectionStatus = 'disconnected';
      });
    });

    socket.addEventListener('message', (evt) => {
      const normData = normalizeDetection(JSON.parse(evt.data));
      if (normData) {
        runInAction(() => {
          this._detections.push(normData);
          if (this._detections.length > LIMIT_FOR_RELOAD) {
            location.reload();
          }
          this._radius = normData.radiusKm;
        });
      }
    });
  }

  submitRadius() {
    const radiusInt = parseInt(this._form.radius);
    if (!Number.isFinite(radiusInt)) {
      return;
    }
    if (this._socket && this._connectionStatus === 'connected') {
      this._socket.send(JSON.stringify({ radius: radiusInt }));

      runInAction(() => {
        this._radiusSentMessageVisible = true;
      });

      setTimeout(() => {
        runInAction(() => {
          this._radiusSentMessageVisible = false;
        });
      }, 2000);
    }
  }
}
