import { Sleep } from "./funcitons.js";

class Tunime {
    static get standart() {
        return { id: 'shadow', key: 'tunime-register', date: Date.now() - 10000 }
    }

    constructor() {
        this.lk = 'shadow-api';
        this.life = 350000;
        this.time = 299000;
        this.interval = undefined;
        this.url = 'tunime.onrender.com';
        if (window.location.pathname != '/player.html') {
            this.Update();
        }
    }

    set access(val) {
        if (val && val?.id && val?.key && val?.date) {
            localStorage.setItem(this.lk, JSON.stringify(val));
        }
    }

    /**
     * @returns {{id: string, key: string, date: number}}
     */
    get access() {
        let inl = localStorage.getItem(this.lk);
        inl = inl || JSON.stringify(Tunime.standart);
        let val = JSON.parse(inl);
        if ((new Date() - val.date) > this.life) {
            val = Tunime.standart;
        }
        this.access = val;
        return val;
    }

    online() {
        const data = this.access;
        fetch(`https://${this.url}/online/`, {
            method: 'POST',
            body: new URLSearchParams({ id: data.id, key: data.key })
        }).then((response) => {
            return response.json()
        }).then((val) => {
            this.access = { id: val.id, key: val.key, date: Date.now() }
            this.Update();
        }).catch(async (reas) => {
            this.access = Tunime.standart;
            await Sleep(1000);
            this.Update();
        });
    }

    Update() {
        if (this.access.id == 'shadow') {
            this.online();
        }
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.online();
        }, this.time - (Date.now() - this.access.date));
    }

    anime(id) {
        const data = this.access;
        fetch(`https://${this.url}/online/${id}/o`, {
            method: 'POST',
            body: new URLSearchParams({ id: data.id, key: data.key })
        }).then((response) => {
            return response.json();
        }).then((val) => {
            this.access = { id: val.id, key: val.key, date: Date.now() }
        }).catch(async (err) => {
            await Sleep(1000);
            this.anime(id);
        });
    }

    stream(url) {
        return new Promise(async (resolve) => {
            const access = this.access;
            fetch(`https://anime-m3u8.onrender.com/link-anime`, {
                body: new URLSearchParams({
                    'link': url,
                    'id': access.id,
                    'key': access.key
                }), method: 'post'
            }).then((response) => {
                return response.json();
            }).then((data) => {
                this.access = { id: access.id, key: data.key, date: Date.now() };
                return resolve(data);
            }).catch((res) => {
            });
        });
    }

    link({ q720 = undefined, q480 = undefined, q360 = undefined } = {}) {
        const params = { q720, q480, q360 };
        const queryParams = Object.entries(params)
            .filter(([key, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        return `https://anime-m3u8.onrender.com/m3u8?${queryParams}`;
    }
}

export const ApiTunime = new Tunime();