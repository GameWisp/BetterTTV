const twitch = require('../../utils/twitch');
const globalEmotes = require('./global-emotes');
const channelEmotes = require('./channel-emotes');
const personalEmotes = require('./personal-emotes');
const emojis = require('./emojis');
const gwGlobalEmotes = require('./gw-global-emotes');
const settings = require('../../settings');

class EmotesModule {
    constructor() {
        this.emoteProviders = [
            personalEmotes,
            globalEmotes,
            channelEmotes,
            gwGlobalEmotes,
            emojis
        ];

        settings.add({
            id: 'bttvEmotes',
            name: 'BetterTTV Emotes',
            defaultValue: true,
            description: 'BetterTTV adds extra cool emotes for you to use.'
        });

        settings.add({
            id: 'bttvGIFEmotes',
            name: 'BetterTTV GIF Emotes',
            defaultValue: false,
            description: 'We realize not everyone likes GIFs, but some people do.'
        });

        settings.add({
            id: 'gwEmotes',
            name: 'GameWisp Emotes',
            defaultValue: false,
            description: 'Use GameWisp emotes'
        });
    }

    getEmotes() {
        let emotes = [];
        for (const provider of this.emoteProviders) {
            const currentUser = twitch.getCurrentUser();
            emotes = emotes.concat(
                provider.getEmotes(currentUser)
                    .filter(emote => {
                        if (!emote.isUsable(null, currentUser)) return false;
                        if (emote.imageType === 'gif' && settings.get('bttvGIFEmotes') === false) return false;
                        if (emote.provider.id.startsWith('bttv') && settings.get('bttvEmotes') === false) return false;
                        if (emote.provider.id.startsWith('gw') && settings.get('gwEmotes') === false) return false;
                        return true;
                    })
            );
        }

        return emotes;
    }

    getEligibleEmote(code, user) {
        const channel = twitch.getCurrentChannel();

        for (let i = 0; i < this.emoteProviders.length; i++) {
            const provider = this.emoteProviders[i];
            const emote = provider.getEligibleEmote(code, user);
            if (!emote || !emote.isUsable(channel, user)) continue;
            if (emote.imageType === 'gif' && settings.get('bttvGIFEmotes') === false) continue;
            if (emote.provider.id.startsWith('bttv') && settings.get('bttvEmotes') === false) continue;
            if (emote.provider.id.startsWith('gw') && settings.get('gwEmotes') === false) continue;
            return emote;
        }

        return null;
    }
}

module.exports = new EmotesModule();
