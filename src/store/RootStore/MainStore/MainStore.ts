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
  | '_socket1'
  | '_socket2'
  | '_connectionStatus'
  | '_connectionStatus1'
  | '_connectionStatus2'
  | '_detections'
  | '_detections1'
  | '_detections2'
  | '_radius'
  | '_radiusSentMessageVisible'
  | '_form';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

const LIMIT_FOR_RELOAD = 100;
const WEB_SOCKET_SERVERS = [
  'ws://localhost:8000',
  'ws://localhost:8001',
  'ws://localhost:8002'
] as const;

export default class MainStore {
  private _sockets: [WebSocket | null, WebSocket | null, WebSocket | null] = [null, null, null];
  private _connectionStatuses: ConnectionStatus[] = ['disconnected', 'disconnected', 'disconnected'];
  private _detectionsGroups: DetectionModel[][] = [[], [], []];
  private _radius = 10;
  private _radiusSentMessageVisible = false;
  private _form = { radius: '' };

  constructor() {
    makeObservable<MainStore, PrivateFields>(this, {
      _form: observable,
      form: computed,
      _radiusSentMessageVisible: observable,
      _radius: observable,
      _sockets: observable.ref,
      _connectionStatuses: observable.ref,
      _detectionsGroups: observable,
      detections: computed,
      detections1: computed,
      detections2: computed,
      connectionStatus: computed,
      radius: computed,
      isLoaded: computed,
      connect: action,
      setRadius: action,
    });
    this.connect();
  }

  // Геттеры для сохранения внешнего интерфейса
  get connectionStatus(): ConnectionStatus { return this._connectionStatuses[0]; }
  get detections() { return this._detectionsGroups[0]; }
  get detections1() { return this._detectionsGroups[1]; }
  get detections2() { return this._detectionsGroups[2]; }
  get radius() { return this._radius; }
  get form() { return this._form; }
  get radiusSentMessageVisible() { return this._radiusSentMessageVisible; }
  get isLoaded() { return this._detectionsGroups[0].at(-1) ? true : false; }

  setRadius(val: string) {
    this._form.radius = val;
  }

  connect() {
    WEB_SOCKET_SERVERS.forEach((server, index) => {
      this._connectionStatuses[index] = 'connecting';
      const socket = new WebSocket(server);

      socket.addEventListener('open', () => {
        runInAction(() => {
          this._sockets[index] = socket;
          this._connectionStatuses[index] = 'connected';
        });
      });

      socket.addEventListener('close', () => {
        runInAction(() => {
          this._sockets[index] = null;
          this._connectionStatuses[index] = 'disconnected';
        });
      });

      socket.addEventListener('error', () => {
        runInAction(() => {
          this._sockets[index] = null;
          this._connectionStatuses[index] = 'disconnected';
        });
      });

      socket.addEventListener('message', (evt) => {
        const normData = normalizeDetection(JSON.parse(evt.data));
        if (normData) {
          runInAction(() => {
            this._detectionsGroups[index].push(normData);
            
            // Особое поведение для первого сокета
            if (index === 0 && this._detectionsGroups[0].length > LIMIT_FOR_RELOAD) {
              location.reload();
            }
            
            if (index === 0) {
              this._radius = normData.radiusKm;
            }
          });
        }
      });
    });
  }

  submitRadius() {
    const radiusInt = parseInt(this._form.radius);
    if (!Number.isFinite(radiusInt)) return;

    if (this._sockets[0] && this._connectionStatuses[0] === 'connected') {
      this._sockets[0].send(JSON.stringify({ radius: radiusInt }));

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
