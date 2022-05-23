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
            .isInt({ min: 0 })
            .withMessage('invalid steamId format'),
        param('appId')
            .isInt({ min: 0 })
            .withMessage('invalid appId format'),
        param('stat')
            .isString(),
    ],
    validationMiddleware,

    async (req, res, next) => {
        const {
            steamId,
            appId,
            stat: statName
        } = req.matchedData;

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

        const stat = request.data.playerstats.stats.find(stat => stat.name === statName);

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
            .default(0).isInt({ min: 0, max: 5 })
            .withMessage('invalid round format'),
        query('minutes')
            .default(0).isInt({ min: 0, max: 1 }).toBoolean()
            .withMessage('invalid minutes format'),
        query('recent')
            .default(0).isInt({ min: 0, max: 1 }).toBoolean()
            .withMessage('invalid recent format'),
        query('locale')
            .optional().isString(),
    ],
    validationMiddleware,

    async (req, res, next) => {
        const {
            steamId,
            appId,
            round,
            minutes,
            recent
        } = req.matchedData;

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
        const rawPlaytime = recent ? game.playtime_2weeks : game.playtime_forever;
        const playtime = minutes ? rawPlaytime : rawPlaytime / 60;

        res.send(playtime.toFixed(round));
    }
);

export default router;