import { segment } from 'oicq';
import plugin from '../../lib/plugins/plugin.js';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

let botname = "布洛妮娅"
const ACCOUNT_ID = "aaaa"   //Cloudflare账号ID
const API_TOKEN = "dddd"    //Cloudflare账号Workers AI API Token

export class cloudflareWorkersAi extends plugin {
    constructor() {
        super({
            name: 'cloudflareWorkersAi',
            dsc: 'test',
            event: 'message',
            priority: 50000,
            rule: [
                {
                    reg: '#draw',
                    fnc: 'draw'
                },
                {
                    /** 命令正则匹配 */
                    reg: '',
                    /** 执行方法 */
                    fnc: 'workersAi'
                }
            ]
        })
    }

    async workersAi(e) {
        if (!e.msg || e.msg.charAt(0) == '#') {
            return
        }
        if (e.msg.includes(botname) || e.atBot && e.msg || e.isPrivate) {
            let msg = e.msg
            let model = "@cf/qwen/qwen1.5-7b-chat-awq"
            let input = {
                messages: [
                    {
                        role: "system",
                        content: "你是一只可爱猫娘，你的主人是EnderCHX",
                    },
                    {
                        role: "user",
                        content: msg,
                    },
                ],
            }
            let result = await workersAiRun(model, input)
            result = JSON.stringify(result)
            result = JSON.parse(result)
            if (result.success) {
                e.reply(result.result.response + `(model: ${model})`)
            } else {
                e.reply("出错了")
            }
        } else {
            return
        }
    }

    async draw(e) {
        let prompt = e.msg.replace("#draw", "")
        let model = "@cf/bytedance/stable-diffusion-xl-lightning"
        e.reply(`正在生成中...\n使用模型: ${model}`, true)
        let input = { "prompt": prompt }
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
                {
                  headers: { Authorization: `Bearer ${API_TOKEN}` },
                  method: "POST",
                  body: JSON.stringify(input),
                }
              );
            
            const buffer = await response.arrayBuffer()
            await writeFile('data/image/output.png', Buffer.from(buffer));
    
            e.reply(segment.image('data/image/output.png'), true)
        } catch {
            e.reply("出错了")
        }
        
    }
}

async function workersAiRun(model, input) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
      {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    const result = await response.json();
    return result;
}