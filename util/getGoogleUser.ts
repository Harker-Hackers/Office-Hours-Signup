import { OAuth2Client } from 'google-auth-library';
import { googleUser } from '../types';

const clientId = require("../config.json").googleClientId;
const client = new OAuth2Client(clientId);

export default async (token: string) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId
    });
    const payload = ticket.getPayload();
    if(!payload) {
        throw "User not found";
    }
    return payload as googleUser;
}