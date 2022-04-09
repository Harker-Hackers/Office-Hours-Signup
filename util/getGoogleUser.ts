import { OAuth2Client } from 'google-auth-library';
import { googleUser } from '../types';

const client = new OAuth2Client((global as any).googleClientId);

export default async (token: string) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: (global as any).googleClientId
    });
    const payload = ticket.getPayload();
    if(!payload) {
        throw "User not found";
    }
    return payload as googleUser;
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}