import axios from 'axios';
import { Router } from 'express';
import { param } from 'express-validator';

import { createError } from '../errors.js';
import validator from '../validator.js';

const { STEAM_API_KEY } = process.env;
const STEAM_API_URL = 'https://api.steampowered.com';

const router = Router();

router.get(
    '/user/:steamId/app/:appId/stat/:stat',
    [
        param('steamId')
            .isInt({ min: 0 }).withMessage('invalid steamId format'),
        param('appId')
            .isInt({ min: 0 }).withMessage('invalid appId format'),
        param('stat')
            .isString()
    ],
    validator,

    async (req, res, next) => {
        const { steamId, appId } = req.matchedData;

        const request = await axios.get(`${STEAM_API_URL}/ISteamUserStats/GetUserStatsForGame/v2`, {
            params: {
                key: STEAM_API_KEY,
                appid: appId,
                steamid: steamId
            }
        });

        if (request.status !== 200) {
            return next(createError(400, 'Steam Web API responded with 200 status code'));
        }

        const stats = request.data.playerstats.stats;
        const stat = stats.find(stat => stat.name === req.matchedData.stat);

        if (!stat) {
            return next(createError(404, 'stat not found'));
        }

        res.send(stat.value.toString());
    }
);

export default router;