import mongoose from 'mongoose';

const connect = async (uri: string) => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, { dbName: undefined } as any);
};

export default { connect, mongoose };
