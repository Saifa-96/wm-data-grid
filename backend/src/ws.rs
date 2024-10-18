use std::time::{Duration, Instant};

use actix::{fut, Actor, Addr, Running};
use actix_web_actors::ws;
use uuid::Uuid;

const HEARTBEAT_INtERVAL: Duration = Duration::from_secs(5);
const CLIENt_TIMEOUT: Duration = Duration::from_secs(10);

pub struct WsConn {
    room: Uuid,
    lobby_addr: Addr<Lobby>,
    hb: Instant,
    id: Uuid,
}

impl WsConn {
    pub fn new(room: Uuid, lobby: Addr<Lobby>) -> Self {
        Self {
            id: Uuid::new_v4(),
            room,
            hb: Instant::now(),
            lobby_addr: lobby,
        }
    }
}

impl Actor for WsConn {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);

        let addr = ctx.address();
        self.lobby_addr
            .send(Connect {
                addr: addr.recipient(),
                lobby_id: self.room,
                self_id: self.id,
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => {}
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        self.lobby_addr.do_send(Disconnect {
            id: self.id,
            room_id: self.room,
        });
        Running::Stop
    }
}

impl WsConn {
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_intervel(HEARTBEAT_INtERVAL)
    }
}
