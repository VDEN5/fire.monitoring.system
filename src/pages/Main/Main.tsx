import React from 'react';
import Map from './components/Map/Map';
import styles from './Main.module.scss';
import ResultChain from './components/ResultChain';
import rootStore from '@store/RootStore';
import { observer } from 'mobx-react-lite';
import Button from '@components/Button';
import Text from '@components/Text';

const Main: React.FC = () => {
  const { connectionStatus } = rootStore.main;

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Подключено!';
      case 'connecting':
        return 'Подключение...';
      case 'disconnected':
        return 'Не подключено';
      default:
        return 'Неизвестный статус';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rootStore.main.submitRadius();
  };

  return (
    <div className="container">
      <div className={styles.inner}>
        <Text className={styles.title} tag="div" view="p-20" color="danger">
          Веб-ориентированная информационная система учёта данных аппаратных средств мониторинга лесных пожаров
        </Text>
        <div className={styles.board}>
          <Map />
          <div className={styles.mapParams}>
            <div>
              <Text
                color={
                  connectionStatus === 'connected'
                    ? 'safety'
                    : connectionStatus === 'disconnected'
                    ? 'danger'
                    : 'accent'
                }
              >
                {getStatusText()}
              </Text>
              {connectionStatus === 'disconnected' && (
                <Button
                  className={styles.reconnectButton}
                  onClick={() => rootStore.main.connect()}
                >
                  Переподключиться
                </Button>
              )}
            </div>

            <form className={styles.mapParams__form} onSubmit={handleSubmit}>
              <Text view="p-20">
                Текущий радиус: {rootStore.main.radius} км
              </Text>
              <label className={styles.mapParams__label}>
                <Text tag="div" view="p-16">
                  Введите радиус (км):
                </Text>
                <input
                  type="text"
                  maxLength={10}
                  value={rootStore.main.form.radius}
                  onChange={(e) => {
                    rootStore.main.setRadius(e.target.value);
                  }}
                  className={styles.mapParams__input}
                />
              </label>

              <Button type="submit" className={styles.mapParams__submit}>
                Изменить радиус
              </Button>

              {rootStore.main.radiusSentMessageVisible && (
                <Text color="safety" className={styles.mapParams__message}>
                  ✅ Радиус {rootStore.main.form.radius} км отправлен
                </Text>
              )}
            </form>
          </div>
        </div>
        <ResultChain />
      </div>
    </div>
  );
};

export default observer(Main);
