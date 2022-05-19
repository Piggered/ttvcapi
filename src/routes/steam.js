import axios from 'axios';
import { Router } from 'express';
import { param, query } from 'express-validator';

import { createError } from '#src/errors';
import { authorizationMiddleware, validationMiddleware } from '#src/middlewares';

const { STEAM_API_KEY } = process.env;
const STEAM_API_URL = 'https://api.steampowered.com';

const router = Router();

router.get(
    '/stat/:steamId/:appId/:stat',

    authorizationMiddleware,
    [
        param('steamId')
            .isInt({ min: 0 }).withMessage('invalid steamId format'),
        param('appId')
            .isInt({ min: 0 }).withMessage('invalid appId format'),
        param('stat')
            .isString(),
    ],
    validationMiddleware,

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
            return next(createError(400, 'Steam Web API responded with non 200 status code'));
        }

        const stats = request.data.playerstats.stats;
        const stat = stats.find(stat => stat.name === req.matchedData.stat);

        if (!stat) {
            return next(createError(404, 'stat not found'));
        }

        res.send(stat.value.toString());
    }
);

router.get(
    '/playtime/:steamId/:appId',

    authorizationMiddleware,
    [
        param('steamId')
            .isInt({ min: 0 }).withMessage('invalid steamId format'),
        param('appId')
            .isInt({ min: 0 }).withMessage('invalid appId format'),
        query('round')
            .isInt({ min: 0, max: 5 }).optional().withMessage('invalid round format'),
        query('minutes')
            .isInt({ min: 0, max: 1 }).optional().withMessage('invalid minutes format'),
    ],
    validationMiddleware,

    async (req, res, next) => {
        const { steamId, appId } = req.matchedData;

        const request = await axios.get(`${STEAM_API_URL}/IPlayerService/GetOwnedGames/v1`, {
            params: {
                key: STEAM_API_KEY,
                'appids_filter[0]': appId,
                include_appinfo: 0,
                include_played_free_games: 1,
                steamid: steamId
            }
        });

        if (request.status !== 200) {
            return next(createError(400, 'Steam Web API responded with non 200 status code'));
        }

        if (request.data.response.game_count === 0) {
            return next(createError(404, 'game not found in user\'s library'));
        }

        const game = request.data.response.games[0];
        const playtime = req.matchedData.minutes === '1'
            ? game.playtime_forever
            : game.playtime_forever / 60;

        res.send(playtime.toFixed(req.matchedData.round ?? 0));
    }
);

export default router;