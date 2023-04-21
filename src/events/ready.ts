import ClientEvent from '@/components/ClientEvent';

export default new ClientEvent('ready', (client) => {
  if (client.user) {
    console.info('Successfully Logged in as ' + client.user.tag);
    client.user?.setActivity(client.config.initActivity);
    client.consistentSetActivity();
  }
});
