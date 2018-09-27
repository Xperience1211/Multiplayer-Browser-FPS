import * as THREE from "three";
import uniq from "lodash/uniq";
import without from "lodahs/without";
import { State } from "./state.js";
import {
    Entity,
    Player,
    Bullet,
    Wall,
    AmmoPickup,
    JetpackPickup,
    HpPickup
} from "./entities";
import {
    Action,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SYNC_ALL_PLAYERS,
    SPAWN_PLAYER,
    SPAWN_BULLET_PACK,
    SPAWN_HEALTH_PACK,
    SET_CAMERA_VIEW,
    SET_INPUT,
    SET_AIM,
    SHOOT_BULLET,
    RELOAD_START,
    RELOAD_DONE,
    HIT_PLAYER,
    KILL_PLAYER
} from "./actions.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case PLAYER_JOIN: {
            const { id } = action.data;
            state.playerIds = uniq(state.playerIds.concat([id]));
            return state;
        }
        case PLAYER_LEAVE: {
            const { id } = action.data;
            state.playerIds = without(state.playerIds, [id]);
            return state;
        }
        case SYNC_PLAYER: {
            const { id, x, y, z, vx, vy, vz, rx, ry } = action.data;
            const player = state.getEntity(id);
            if (player !== undefined) {
                if (player.head !== undefined) {
                    player.head.rotation.x = rx;
                }

                if (player.object3D !== undefined) {
                    player.object3D.position.set(x, y, z);
                    player.object3D.rotation.y = ry;
                }

                if (player.velocity !== undefined) {
                    player.velocity.set(vx, vy, vz);
                }
            }
            return state;
        }
        case SYNC_PLAYER_SCORE: {
            const {} = action.data;
            return state;
        }
        case SYNC_ALL_PLAYERS: {
            const {} = action.data;
            return state;
        }
        case SPAWN_PLAYER: {
            const { id, x, y, z } = action.data;
            const player = new Player(id, state.assets);
            player.object3D.position.set(x, y, z);
            state.addEntity(player);
            return state;
        }
        case SPAWN_BULLET_PACK: {
            const {} = action.data;
            return state;
        }
        case SPAWN_HEALTH_PACK: {
            const {} = action.data;
            return state;
        }
        case SET_CAMERA_VIEW: {
            const { width, height } = action.data;
            state.camera.aspect = width / height;
            state.camera.updateProjectionMatrix();
            return state;
        }
        case SET_INPUT: {
            const { id, input, value } = action.data;
            const { controller } = state.getEntityComponents(id);
            if (controller !== undefined) {
                if (controller.input[input] !== undefined) {
                    controller.input[input] = value;
                }
            }
            return state;
        }
        case SET_AIM: {
            const { id, ver, hor } = action.data;
            const { object3D, head } = state.getEntityComponents(id);
            if (object3D && head) {
                object3D.rotation.y = ver;
                head.rotation.x = hor;
            }
            return state;
        }
        case SHOOT_BULLET: {
            const { id } = action.data;
            const player = state.getEntity(id);
            if (player && player.object3D && player.head) {
                // Create bullet
                const bulletId = player.id + Date.now().toString(16);
                const bullet = new Bullet(bulletId, state.assets);
                bullet.damage.creatorId = player.id;

                // Set velocity
                const bulletSpeed = 0.05;
                const direction = player.head.getFacingDirection();
                bullet.velocity.z = direction.z * bulletSpeed;
                bullet.velocity.x = direction.x * bulletSpeed;
                bullet.velocity.y = direction.y * bulletSpeed;

                // Set position
                const playerAABB = player.object3D.getAABB();
                bullet.object3D.position.x = player.object3D.position.x;
                bullet.object3D.position.y = playerAABB.max.y - 0.5;
                bullet.object3D.position.z = player.object3D.position.z;

                // Offset infrotn of camera
                const DIST = 1.25;
                const offset = new THREE.Vector3();
                offset.copy(bullet.velocity);
                offset.normalize();
                offset.multiply(new THREE.Vector3(DIST, DIST, DIST));
                bullet.object3D.position.add(offset);

                state.addEntity(bullet);
            }
            return state;
        }
        case RELOAD_START: {
            const { id } = action.data;
            const { weapon } = state.getEntityComponents(id);
            if (weapon) {
                weapon.reloadTimer = weapon.type.reloadSpeed;
            }
            return state;
        }
        case RELOAD_DONE: {
            const { id } = action.data;
            const { weapon } = state.getEntityComponents(id);
            if (weapon) {
                const requiredAmmo = weapon.type.maxLoadedAmmo - weapon.loadedAmmo;
                const availableAmmo = Math.min(requiredAmmo, weapon.reservedAmmo);
                if (availableAmmo > 0) {
                    weapon.loadedAmmo += availableAmmo;
                    weapon.reservedAmmo -= availableAmmo;
                }
                weapon.reloadTimer = 0;
            }
            return state;
        }
        case HIT_PLAYER: {
            const {} = action.data;
            return state;
        }
        case KILL_PLAYER: {
            return state;
        }
        default:
            return state;
    }
}
