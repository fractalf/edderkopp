import EventEmitter from 'events';

class Bus extends EventEmitter {}

const bus = new Bus();

export default bus;

export function warn(message) {
    bus.emit('log', 'warn', message);
}
