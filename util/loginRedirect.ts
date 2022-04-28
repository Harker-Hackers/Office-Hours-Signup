import { Req, Res } from "../types";

export let redirectToLogin = (req: Req, res: Res, dest?: string) => {
    res.redirect(encodeURI(`/login?dest=${req.baseUrl + req.path}`));
};

export let redirectAfterLogin = (req: Req, res: Res, dest: string) => {
    console.log(req);
    res.redirect(`${encodeURI(dest)}`);
};
