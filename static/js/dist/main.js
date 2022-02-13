class List {
    constructor() {
        this.ne = [-1];
        this.e = [null];
        this.stack = new Stack();
    }

    get_node_index(object) {
        if (stack.size() > 0) return this.stack.pop();
        ne.push(-1);
        e.push(object);
        return ne.length - 1;
    }

    insert(pre, object) {
        let idx = this.get_node_index(object);
        ne[idx] = ne[pre];
        ne[pre] = idx;
    }
}
class Queue {
    constructor(init_size = 1) {
        this.init_size = init_size;
        this.q = [];
        this.q.length = 1;
        this.hh = 0;
        this.tt = 0;
        this.sz = 0;
    }

    push(obj) {
        if (this.sz == this.q.length) {
            let _q = [];
            _q.length = this.q.length * 2;
            for (let i = 0; i < this.q.length; i ++) {
                _q[i] = this.pop();
            }
            this.sz = this.q.length;
            this.q = _q;
            this.hh = 0;
            this.tt = this.sz;
        }
        this.sz ++;
        this.q[this.tt ++] = obj;
        if (this.tt >= this.q.length) this.tt -= this.q.length;
    }

    pop() {
        if (this.sz === 0) return null;
        this.sz --;
        let res = this.q[this.hh ++];
        if (this.hh >= this.q.length) this.hh -= this.q.length;
        return res;
    }

    front() {
        if (this.sz === 0) return null;
        return this.q[this.hh];
    }

    back() {
        if (this.sz === 0) return null;
        return this.q[(this.tt - 1 + this.q.length) % this.q.length];
    }

    clear() {
        this.q = [];
        this.q.length = 1;
        this.tt = 0;
        this.hh = 0;
        this.sz = 0;
    }

    size() {
        return this.sz;
    }

    at(idx) {
        return this.q[(this.hh + idx) % this.q.length];
    }
}class Stack {
    constructor() {
        this.sta = [];
        this.tt = 0;
    }

    clear() {
        this.sta = [];
        this.tt = 0;
    }

    push(object) {
        if (this.tt >= this.sta.length)
            this.sta.push(object);
        else
            this.sta[this.tt] = object;
        this.tt ++;
    }

    pop() {
        if (this.tt <= 0) return null;
        return this.sta[-- this.tt];
    }

    top() {
        if (this.tt <= 0) return null;
        return this.sta[this.tt - 1];
    }

    size() {
        return this.tt;
    }

    clear() {
        this.sta = [];
        this.tt = 0;
    }
}
let GAME_OBJECTS = [];

class GameObject {
    constructor(pa = null) {
        GAME_OBJECTS.push(this);
        this.pa = pa;
        if (this.pa) this.pa.childrens.push(this);
        this.active = true;
        this.have_call_start = false;
        this.get_uid()
        this.components = [];
        this.childrens = [];
        this.playground = null;
        this.pos = new Vector2(0, 0);
        this.world_pos = new Vector2(0, 0);
    }

    get_uid() {
        let uid = "";
        for (let i = 0; i < 10; i ++) {
            uid += Math.floor(Math.random() * 10);
        }
        this.uid = uid;
    }

    get_world_pos() {
        this.world_pos.copy(this.pos);
        if (this.pa) this.world_pos.add(this.pa.world_pos)
        return this.world_pos;
    }

    set_active(is_active) {
        this.active = is_active;
        for (let i = 0; i < this.childrens.length; i ++)
            this.childrens[i].set_active(is_active);
    }

    start() {
    }

    update() {
    }

    late_update() {
    }

    on_destroy() {
    }

    on_collision_enter() {
    }

    components_destroy() {
        for (let i = 0; i < this.components.length; i ++) {
            this.components[i].game_object = null;
            this.components[i].on_destroy();
        }
    }

    childrens_destroy() {
        for (let i = 0; i < this.childrens.length; i ++) {
            this.childrens[i].pa = null;
            this.childrens[i].destroy();
        }
    }

    add_component(component) {
        component.game_object = this;
        component.start();
        this.components.push(component);
        return component;
    }

    destroy() {
        this.playground = null;
        this.on_destroy();
        this.components_destroy();
        this.childrens_destroy();
        if (this.pa) {
            for (let i = 0; i < this.pa.childrens.length; i ++) {
                if (this.pa.childrens[i] === this) {
                    this.pa.childrens.splice(i, 1);
                    break;
                }
            }
        }
        for (let i = 0; i < GAME_OBJECTS.length; i ++) {
            let object = GAME_OBJECTS[i];
            if (object === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

class Component {
    constructor() {
        this.enable = true;
        this.game_object = null;
    }

    start() {
    }

    update() {
    }

    on_destroy() {
    }
}

class Time {
    static set_pause(is_pause) {
        if (Time.is_pause === is_pause) return;
        if (is_pause === false) {
            Time.pause_tag = true;
        } else {
            Time.pause_tag = false;
            Time.is_pause = true;
        } 
    }
}
Time.is_pause = false;
Time.pause_tag = false;
Time.deltaTime = 0;

class Camera {
    constructor(playground) {
        this.playground = playground;
        this.pos = new Vector2(0, 0);
        this.width = playground.width;
        this.height = playground.height;
    }

    set_follow(object) {
        if (object) {
            this.pos = object.pos;
        } else {
            this.pos = new Vector2(this.pos.x, this.pos.y);
        }
    }
}
let COLLIDERS = [];

let LYAER_TABLE = [
    [1, 1],
    [1, 0]
];

class Collider extends Component {
    constructor(layer = 0) {
        super();
        this.is_trigger = false;
        this.layer = layer
        this.rb = null;
        COLLIDERS.push(this);
    }

    start() {
        this.pos = this.game_object.pos;
        if (this.game_object.rigidbody != undefined && this.game_object.rigidbody != null) {
            this.rb = this.game_object.rigidbody;
            this.rb.collider = this;
        }
    }

    on_destroy() {
        for (let i = 0; i < COLLIDERS.length; i ++) {
            if (COLLIDERS[i] === this) {
                COLLIDERS.splice(i, 1);
                break;
            }
        }
    }

    send_collision_message(collider) {
        if (collider.is_trigger) {
            collider.game_object.on_trigger_enter(this);
        } else {
            this.game_object.on_collision_enter(collider);
            if (collider.rb == null) collider.game_object.on_collision_enter(this);
        }
    }

    static find1(pos1, radius1, pos2, radius2) {
        let len = Vector2.distance(pos1, pos2);
        return len < radius1 + radius2;
    }

    static find2(pos1, width1, height1, pos2, width2, height2) {
        let flag1 = Math.abs(pos1.x - pos2.x) < width1 / 2 + width2 / 2;
        let flag2 = Math.abs(pos1.y - pos2.y) < height1 / 2 + height2 / 2;
        return flag1 && flag2
    }

    static find_collision_circle_circle(a, b) {
        let len = Vector2.distance(a.game_object.pos, b.game_object.pos);
        return len < a.radius + b.radius;
    }

    static find_collision_rect_rect(a, b) {
        let tag = LYAER_TABLE[a.layer][b.layer];
        if (tag === 0) return;
        let pos_a = a.game_object.get_world_pos(), pos_b = b.game_object.get_world_pos();
        let flag1 = Math.abs(pos_a.x - pos_b.x) < a.width / 2 + b.width / 2;
        let flag2 = Math.abs(pos_a.y - pos_b.y) < a.height / 2 + b.height / 2;
        return flag1 && flag2;
    }
}

class CircleCollider extends Collider {
    constructor(radius) {
        super();
        this.radius = radius;
        this.tag = "circle";
    }

    find_collision() {
        let result = false;
        for (let i = 0; i < COLLIDERS.length; i ++) {
            let collider = COLLIDERS[i];
            if (!collider.game_object.active) continue;
            if (collider === this) continue;
            if (collider.tag === "circle") {
                let collision_flag = Collider.find_collision_circle_circle(this, collider);
                if (collision_flag) this.send_collision_message(collider);
                if (collision_flag && !collider.is_trigger) result = true;
            }
        }
        return result;
    }
}

class RectCollider extends Collider {
    constructor(width, height, layer = 0) {
        super(layer);
        this.width = width;
        this.height = height;
        this.tag = "rect";
    }

    find_collision() {
        let result = false;
        for (let i = 0; i < COLLIDERS.length; i ++) {
            let collider = COLLIDERS[i];
            if (!collider.game_object.active) continue;
            if (collider === this) continue;
            if (collider.tag === "rect") {
                let collision_flag = Collider.find_collision_rect_rect(this, collider);
                if (collision_flag) this.send_collision_message(collider);
                if (collision_flag && !collider.is_trigger) result = true;
            }
        }
        return result;
    }
}
let RENDERS = [];

function add_render(render) {
    for (let i = 0; i < RENDERS.length; i ++) {
        if (render.layer < RENDERS[i].layer) {
            RENDERS.splice(i, 0, render);
            return;
        }
    }
    RENDERS.push(render);
}

class Render extends Component {
    constructor(layer = 0) {
        super();
        this.layer = layer;
        this.relation = "world";
        add_render(this);
    }

    start() {
        if (this.ctx === null || this.ctx === undefined) this.ctx = this.game_object.playground.ctx;
        this.camera = this.game_object.playground.camera;
    }

    get_render_pos() {
        let world_pos = this.game_object.get_world_pos();
        let render_pos = new Vector2(world_pos.x, world_pos.y);
        if (this.relation === "world") {
            render_pos.reduce(this.camera.pos);
            render_pos.add(new Vector2(this.camera.width / 2, this.camera.height / 2));
        }
        return render_pos;
    }

    render() {

    }

    on_destroy() {
        for (let i = 0; i < RENDERS.length; i ++) {
            if (RENDERS[i] === this) {
                RENDERS.splice(i, 1);
                break;
            }
        }
    }
}
class CircleRender extends Render {
    constructor(radius, color, image_src = null, layer = 0) {
        super(layer);
        this.radius = radius;
        this.color = color;
        if (image_src != null) {
            this.image = new Image();
            this.image.src = image_src;
        } else this.image = null;
    }

    render() {
        let scale = this.game_object.playground.scale;
        let render_pos = this.get_render_pos();
        let x = render_pos.x;
        let y = render_pos.y;
        if (!this.image) {
            this.ctx.beginPath();
            this.ctx.fillStyle = this.color;
            this.ctx.arc(x * scale, y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fill();
        } else {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x * scale, y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.image, (x - this.radius) * scale, (y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
    }
}
class RectRender extends Render {
    constructor(width, height, color, image_src = null, layer = 0) {
        super(layer);
        this.width = width;
        this.height = height;
        this.color = color;
        if (image_src) {
            this.image = new Image();
            this.image.src = image_src;
        } else {
            this.image = null;
        }
    }

    render() {
        let scale = this.game_object.playground.scale;
        let render_pos = this.get_render_pos();
        let x = render_pos.x - this.width / 2;
        let y = render_pos.y - this.height / 2;
        if (this.image) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(x * scale, y * scale, this.width * scale, this.height * scale);
            this.ctx.drawImage(this.image, x * scale, y * scale, this.width * scale, this.height * scale);
        } else {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(x * scale, y * scale, this.width * scale, this.height * scale);
        }
    }
}

class Text extends Render {
    constructor(text = "", color = "white", align = "center", layer = 0) {
        super(layer);
        this.text = text;
        this.text_color = color;
        this.text_align = align;
        this.text_font = "20px serif";
    }

    render() {
        let scale = this.game_object.playground.scale;
        let render_pos = this.get_render_pos();
        this.ctx.font = this.text_font;
        this.ctx.fillStyle = this.text_color;
        this.ctx.textAlign = this.text_align;
        this.ctx.fillText(this.text, render_pos.x * scale, render_pos.y * scale);
    }
}
let eps = 0.00001;
class Rigidbody extends Component {
    constructor() {
        super();
        this.v = new Vector2(0, 0);
        this.t = null;
        this.speed = 0;
        this.moses = 0;
        this.have_gravity = true;
        this.gravity = 0.5;
        this.gravity_speed = 0;
        this.max_gravity_speed = 1;
        this.collider = null;
    }

    start() {
        this.pos = this.game_object.pos;
        this.last_pos = new Vector2(this.pos.x, this.pos.y);
    }

    move_to(x, y, speed, moses) {
        this.t = new Vector2(x, y);
        this.speed = speed, this.moses = moses;
        this.v.set(x - this.pos.x, y - this.pos.y);
        this.v.nomalize();
    }

    move_towards(x, y, speed, moses) {
        this.t = null;
        this.speed = speed, this.moses = moses;
        this.v.set(x - this.pos.x, y - this.pos.y);
        this.v.nomalize();
    }

    move_position(x, y) {
        if (!this.enable) return;
        let _x = this.pos.x, _y = this.pos.y;
        this.pos.set(x, y);
        if (!this.collider) return true;;
        if (this.collider.find_collision() === true) {
            this.pos.set(_x, _y);
            return false;
        }
        return true;
    }

    update() {
        this.update_move();
        this.update_gravity();
    }

    update_gravity() {
        if (this.have_gravity === false) return;
        if (this.move_position(this.pos.x, this.pos.y + this.gravity_speed * Time.deltaTime) === false) {
            do {
                this.gravity_speed /= 2;
                this.move_position(this.pos.x, this.pos.y + this.gravity_speed * Time.deltaTime);
            } while (this.gravity_speed > eps);
            this.gravity_speed = 0;
            return;
        }
        this.gravity_speed = Math.min(this.max_gravity_speed, this.gravity_speed + this.gravity * Time.deltaTime);
    }

    update_move() {
        return;
        if (this.speed <= 0) return;
        let move_pos = new Vector2(this.pos.x, this.pos.y);
        let move_len = this.speed * Time.deltaTime;
        if (this.t) {
            let len = Vector2.distance(this.pos, this.t);
            if (len <= move_len) {
                move_pos.set(this.t.x, this.t.y);
                this.speed = 0;
            } else {
                move_pos.add(new Vecotr2(this.v.x * move_len, this.v.y * move_len));
            }
        }
        else {
            move_pos.add(new Vector2(this.v.x * move_len, this.v.y * move_len));
        }
        this.speed = Math.max(0, this.speed - this.moses * Time.deltaTime);
        if (!this.collider) {
            this.pos.set(move_pos.x, move_pos.y);
        } else {
            let _x = this.pos.x, _y = this.pos.y;
            this.pos.set(move_pos.x, move_pos.y);
            if (this.collider.find_collision()) {
                this.pos.set(_x, _y);
            }
        }
    }

    on_destroy() {
        this.collider = null;
    }
}
class EventManager {
    constructor() {
        this.init();
    }

    init() {
        this.arr = [];
    }

    on(event, callback) {
        if (this.arr[event] === undefined) this.arr[event] = [];
        this.arr[event].push(callback);
    }

    emit(event, e = null) {
        if (this.arr[event] === undefined) return;
        for (let i = 0; i < this.arr[event].length; i ++) {
            this.arr[event][i](e);
        }
    }
}class Physics {
    static overlarp_rect(pos, width, height, layer_mask = 0) {
        let colliders = [];
        for (let i = 0; i < COLLIDERS.length; i ++) {
            let collider = COLLIDERS[i];
            if (collider.layer != layer_mask || collider.is_trigger) continue;
            if (collider.tag === "rect") {
                if (Collider.find2(pos, width, height, collider.game_object.get_world_pos(), collider.width, collider.height))
                    colliders.push(collider);
            }
        }
        return colliders
    }
}
class Random {
    static random(l, r) {
        let v = Math.random() * (r - l);
        return v + l;
    }
}
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cal();
    }

    cal() {
        let x = this.x, y = this.y;
        this.magnitude = Math.sqrt(x * x + y * y);
        this.sqrt_magnitude = x * x + y * y;
    }

    nomalize() {
        let x = this.x, y = this.y;
        let angle = Math.atan2(y, x);
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
        this.magnitude = 1;
        this.sqrt_magnitude = 1;
    }

    equals(v) {
        return this.x == v.x && this.y == v.y;
    }

    set_x(x) {
        this.x = x;
        this.cal();
    }

    set_y(y) {
        this.y = y;
        this.cal();
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        this.cal();
    }

    copy(v) {
        this.set(v.x, v.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.cal();
    }

    reduce(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.cal();
    }

    divide(v) {
        this.x /= v;
        this.y /= v;
        this.cal();
    }

    mul(v) {
        this.x *= v;
        this.y *= v;
        this.cal();
    }

    static sqrt_distance(a, b) {
        let x1 = a.x, y1 = a.y;
        let x2 = b.x, y2 = b.y;
        let x = x1 - x2, y = y1 - y2;
        return x * x + y * y;
    }

    static distance(a, b) {
        let x1 = a.x, y1 = a.y;
        let x2 = b.x, y2 = b.y;
        let x = x1 - x2;
        let y = y1 - y2;
        return Math.sqrt(x * x + y * y);
    }

    static lerp(a, b, t) {
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        let v = new Vector2(b.x, b.y);
        v.reduce(a);
        v.mul(t);
        v.add(a);
        return v;
    }
}

let last_timestamp = 0;
let GAME_ANIMATION = function(timestamp) {
    if (Time.is_pause) {
        last_timestamp = timestamp;
        if (Time.pause_tag) {
            Time.is_pause = false;
        }
    } 
    Time.deltaTime = (timestamp - last_timestamp) / 1000;
    if (Time.deltaTime > 1) {
        //alert("Time.deltaTime error!!!!!");
    } 
    for (let i = 0; i < GAME_OBJECTS.length; i ++) {
        let object = GAME_OBJECTS[i];
        if (!object.active) continue;
        //object.get_world_pos();
        if (!object.have_call_start) {
            object.have_call_start = true;
            object.world_pos.copy(object.pos);
            object.start();
        } else {
            for (let j = 0; j < object.components.length; j ++) {
                let component = object.components[j];
                if (!component.enable) continue;
                component.update();
            }
            object.get_world_pos();
            object.update();
        }
    }
    for (let i = 0; i < RENDERS.length; i ++) {
        let render = RENDERS[i];
        if (!render.enable) continue;
        let game_object = render.game_object;
        if (!game_object.active) continue;
        RENDERS[i].render();
    }
    last_timestamp = timestamp;
    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION);

class InfoDisplay {
    constructor(root) {
        this.root = root;
        this.$info_display = $(`
<div class="fuckjump-info_display">
    <div class="fuckjump-info_display-item">
        <img class="fuckjump-info_display-item-photo">
    </div>
    <br>
    <div class="fuckjump-info_display-item">
        <div class="fuckjump-info_display-item-openid">
        </div>
    </div>
</div>
        `);
        this.root.$main_object.append(this.$info_display);
        this.$photo = this.$info_display.find(".fuckjump-info_display-item-photo");
        this.$openid = this.$info_display.find(".fuckjump-info_display-item-openid");
        this.$info_display.hide();
        this.info_modify = new InfoModify(this);
        this.add_listening_events();
    }

    update_info() {
        let photo = this.root.settings.photo;
        let openid = this.root.settings.openid;
        this.$photo.attr("src", photo);
        this.$openid.html(openid);
        this.show();
    }

    add_listening_events() {
        let outer = this;
        this.$photo.click(function(){
            outer.info_modify.show();
            outer.hide();
        });
    }

    show() {
        this.$info_display.show();
    }

    hide() {
        this.$info_display.hide();
    }
}
class InfoModify {
    constructor(info_display) {
        this.info_display = info_display;
        this.root = info_display.root;
        this.$info_modify = $(`
<div class="fuckjump-info_modify">
    <div class="fuckjump-info_modify-field">
        <div class="fuckjump-info_modify-title-field">
            <div class="fuckjump-info_modify-title">
                Infomation
            </div>
        </div>
        <div class="fuckjump-info_modify-item-field-1">
            <div class="fuckjump-info_modify-item-introduce">
                Username:
            </div>
            <div class="fuckjump-info_modify-item-introduce">
                Openid:
            </div>
            <div class="fuckjump-info_modify-item-introduce">
                Photo:
            </div>
            <div class="fuckjump-info_modify-item-image-introduce">
                Photo Image:
            </div>
            <div class="fuckjump-info_modify-item-introduce">
                Max Score:
            </div>
        </div>
        <div class="fuckjump-info_modify-item-field-2">
            <div class="fuckjump-info_modify-item-username">
                <div class="fuckjump-info_modify-item">
                    <input type="text" readonly>
                </div>
            </div>
            <div class="fuckjump-info_modify-item-openid">
                <div class="fuckjump-info_modify-item">
                    <input type="text">
                </div>
            </div>
            <div class="fuckjump-info_modify-item-photo">
                <div class="fuckjump-info_modify-item">
                    <input type="text">
                </div>
            </div>
            <div class="fuckjump-info_modify-item-image">
                <img class="fuckjump-info_modify-item-photo-display">
            </div>
            <div class="fuckjump-info_modify-item-max_score">
                <div class="fuckjump-info_modify-item">
                    <input type="text" readonly>
                </div>
            </div>
        </div>
        <div class="fuckjump-info_modify-button-field">
            <div class="fuckjump-info_modify-button-item">
                <button>Modify</button>
            </div>
        </div>
    </div>
</div>
        `);

        this.root.$main_object.append(this.$info_modify);
        this.$username = this.$info_modify.find(".fuckjump-info_modify-item-username input");
        this.$openid = this.$info_modify.find(".fuckjump-info_modify-item-openid input");
        this.$photo = this.$info_modify.find(".fuckjump-info_modify-item-photo input");
        this.$photo_display = this.$info_modify.find(".fuckjump-info_modify-item-photo-display");
        this.$max_score = this.$info_modify.find(".fuckjump-info_modify-item-max_score input");
        this.$submit = this.$info_modify.find(".fuckjump-info_modify-button-item button");
        this.$info_modify.hide();
        this.add_listening_events();
    }

    show() {
        let settings = this.root.settings;
        this.$username.val(settings.username);
        this.$openid.val(settings.openid);
        this.$photo.val(settings.photo);
        this.set_photo_image(settings.photo);
        this.$max_score.val(settings.max_score);
        this.$info_modify.show(); 
    }

    hide() {
        this.$info_modify.hide();
    }

    add_listening_events() {
        if (this.is_add_listening_events) return;
        this.is_add_listening_events = true;
        let outer = this;
        this.$photo.change(function(){
           outer.set_photo_image(outer.$photo.val()); 
        });
        this.$submit.click(function(){
            outer.save();
        })
    }

    set_photo_image(url) {
        this.$photo_display.attr("src", url);
    }

    save() {
        let outer = this;
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/update_info/",
            type: "GET",
            data: {
                openid: outer.$openid.val(),
                photo: outer.$photo.val(),
            },
            success: function(resp) {
                let res = resp.result;
                if (res === "success") {
                    outer.on_info_modify_success();
                }
            }
        })
    }

    on_info_modify_success() {
        let settings = this.root.settings;
        settings.openid = this.$openid.val();
        settings.photo = this.$photo.val();
        this.info_display.update_info();
        this.hide();
        this.info_display.show();
    }
}export class MainObject {
    constructor(id) {
        this.id = id;
        this.$main_object = $('#' + id);
        this.menu = new Menu(this);
        this.playground = new GamePlayground(this);
        // this.settings = new Settings(this);
        // this.info_display = new InfoDisplay(this);
        this.start();
    }

    start() {
        // let outer = this;
        // this.settings.set_on_user_get(function(){
        //     outer.settings.hide();
        //     outer.info_display.update_info();
        //     outer.info_display.show();
        //     outer.menu.show();
        // });
        this.menu.show();
    }
}
class Menu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="fuckjump-menu">
    <div class="fuckjump-menu-field">
        <div class="fuckjump-menu-field-item fuckjump-menu-field-item-single-player-mode">
            <div>
                Single Player Mode
            </div>
        </div>
        <br>
        <div class="fuckjump-menu-field-item fuckjump-menu-field-item-multi-player-mode">
            Multi Player Mode
        </div>
        <br>
        <div class="fuckjump-menu-field-item fuckjump-menu-field-item-quit">
            Quit
        </div>
    </div>
</div>
`);
        this.root.$main_object.append(this.$menu);
        this.$single_player_mode = this.$menu.find(".fuckjump-menu-field-item-single-player-mode");
        this.$multi_player_mode = this.$menu.find(".fuckjump-menu-field-item-multi-player-mode");
        this.$quit = this.$menu.find(".fuckjump-menu-field-item-quit");
        this.hide();
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_player_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single");
        });
        this.$multi_player_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi");
        });
        this.$quit.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}
class Background extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.pos.set(this.playground.width / 2, this.playground.height / 2);
        this.color = "rgba(0, 0, 0, 1)";
        //this.background_jpg = "http://101.200.142.161:8000/static/image/playground/background.jpg";
        this.background_jpg = null;
        this.rect_render = this.add_component(new RectRender(this.playground.width, this.playground.height, this.color, this.background_jpg, -1));
        this.rect_render.relation = "screen";
    }
}
class Map extends GameObject {

    constructor(playground, data) {
        super();
        this.playground = playground;
        this.map_manager = playground.map_manager;
        this.data = data;
        this.width = playground.width;
        this.height = playground.height;
        this.is_pause = false;
        this.is_multi = (playground.mode === "multi");
        this.create();
    }

    create() {
        this.init_player();
        this.create_scoreboard();
        this.create_platforms();
        if (this.is_pause) this.playground.$canvas.focus();
    }

    init_player() {
        let players = this.playground.player_manager.players;
        for (let i = 0; i < players.length; i ++) {
            let player = players[i];
            player.pos.copy(this.get_init_pos());
            player.reset();
            if (!this.is_multi) player.set_pause(false);
        }
    }

    get_init_pos() {
        return new Vector2(this.width / 2, 0);
    }

    create_platforms() {
        this.platform_manager = new PlatformManager(this.playground, this, null);
        let outer = this;
        this.platform_manager.event_manager.on("trigger", function(){
            outer.scoreboard.add_score(1);
        }); 
    }

    create_scoreboard() {
        this.scoreboard = new Scoreboard(this.playground, this.width / 2, this.height / 10, this);
    }

    update() {
        this.update_player_state();
    }

    update_player_state() {
        let player = this.playground.player_manager.self_player();
        if (this.is_multi === false) {
            if (player.pos.y > this.platform_manager.get_standered_height()) {
                this.set_die();
            }
        } else {
            let players = this.playground.player_manager.players;
            for (let i = 0; i < players.length; i ++) {
                for (let j = i + 1; j < players.length; j ++) {
                    if (Vector2.sqrt_distance(players[i].pos, players[j].pos) > this.height * 3 / 4) {
                        this.set_die();
                        return;
                    }
                }
            }
        }
    }

    hide() {
        this.scoreboard.destroy();
        this.platform_manager.destroy();
    }

    set_die() {
        if (this.scoreboard.text.text === "Die") return;
        this.scoreboard.text.text = "Die";
        //this.playground.player_manager.self_player().set_pause(true);
        this.playground.player_manager.set_pause_all(true);
        this.settlement();
        let outer = this;
        setTimeout(function(){ outer.reset(); }, 1500);
    }

    reset() {
        if (this.is_pause) {
            this.have_to_reset = true;
            return;
        }
        //this.hide();
        //this.create();
        this.init_player();
        this.scoreboard.reset();
        this.platform_manager.reset();
        if (this.is_pause) this.playground.$canvas.focus();
    }

    set_pause(is_puase) {
        if (is_puase === this.is_pause) return;
        this.is_pause = is_puase;
        this.playground.player_manager.self_player().set_pause(is_puase);
        if (this.have_to_reset === true) {
            this.reset();
            this.have_to_reset = false;
        }
    }

    on_destroy() {
        this.hide();
        this.scoreboard = null;
        this.platform_manager = null;        
    }

    settlement() {
        // this.playground.root.settings.update_max_score(this.scoreboard.score);
    }
}class MapManager extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.is_pause = false;
        this.is_multi = (playground.mode === "multi");
        this.awake();
    }

    awake() {
        this.create(); 
    }

    create() {
        this.map = new Map(this.playground, null);
    }

    set_pause(is_pause) {
        this.map.set_pause(is_pause);
    }

    reset() {
        this.map.reset();
    }

    on_destroy() {
        this.map.destroy();
        this.map = null;
    }
}class Platform extends GameObject {
    constructor(playground, x, y, width, height, color, photo = null, pa = null) {
        super(pa);
        this.playground = playground;
        this.map = pa;
        this.pos.set(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
        this.photo = photo;
        this.tag = "platform";
        this.event_manager = new EventManager();
        this.awake();
    }

    awake() {
        this.set_parameters();
        this.create_trap();
    }

    set_parameters() {
        this.trap_width = this.width / 6;
        this.trap_heigth = this.trap_width;
    }

    create_trap() {
        this.trap = new Trap(this.playground, 0, -this.trap_heigth / 2 - this.height / 2, this.trap_width, this.trap_heigth, "red", null, this);
    }

    start() {
        this.rect_render = this.add_component(new RectRender(this.width, this.height, this.color, this.photo, 1));
        this.rect_collider = this.add_component(new RectCollider(this.width, this.height));
    }

    reset() {
        this.trap.active = true;
        let random_x = Random.random(this.width / 2, this.map.width - this.width / 2);
        this.pos.set_x(random_x);
        this.reset_trap();
    }

    reset_trap() {
        this.trap.pos.set_x(Random.random(-this.width / 2 + this.trap_width / 2, this.width / 2 - this.trap_width / 2));
    }

    on_collision_enter(collider) {
        if (collider.game_object.tag != "player" || collider.game_object.character != "player self") return;
        this.event_manager.emit("player enter", collider.game_object.uid);
    }

    resize(size) {
        this.width = size.x;
        this.height = size.y;
        if (this.rect_render) {
            this.rect_render.width = this.width;
            this.rect_render.height = this.height;
        }
        if (this.rect_collider) {
            this.rect_collider.width = this.width;
            this.rect_collider.height = this.height;
        }
        this.set_parameters();
        this.trap.resize(new Vector2(this.trap_width, this.trap_heigth));
        this.trap.pos.set_y(-this.trap_heigth / 2 - this.height / 2);
    }
}
class PlatformManager extends GameObject {
    constructor(playground, map, data) {
        super();
        this.playground = playground;
        this.map = map;
        this.data = data;
        this.is_multi = this.map.is_multi;
        this.event_manager = new EventManager();
        this.idx_tag = -1;
        this.awake();
    }

    awake() {
        this.count = 5;
        this.mode = "cycle";
        this.min_idx = 0;
        this.max_idx = 0;
        this.craete_init();
        this.platform_socket = (this.playground.mode === "multi" ? new PlatformSocket(this) : null);
        if (!this.is_multi) this.create();
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        if (this.is_multi) {
            this.playground.web_sockets.event_manager.on("change character", function(character){
                if (character === "master")
                    outer.create();
                    outer.playground.web_sockets.send_start_game();
            });
        }
    }

    craete_init() {
        this.platforms = new Queue(this.count);
        this.nodes = new Stack();
        this.idxs = [];
    }

    create() {
        for (let i = 0; i < this.count; i ++) {
            let y = (i === 0 ? this.get_height_init() : this.platforms.back().pos.y + this.get_height_add());
            let p = this.get_new(i);
            p.pos.set_y(y);
            this.reset_platform(p, i != 0);   
            this.platforms.push(p);
            if (this.platform_socket) this.platform_socket.send_create(p);
        } 
    }

    reset_platform(p, random = true) {
        p.set_active(true);
        if (random) {
            let size = this.get_size();
            p.pos.set_x(Random.random(size.x / 2, this.map.width - size.x / 2));
            p.resize(size);
            p.trap.pos.set_x(Random.random(-p.width / 2 + p.trap_width / 2, p.width / 2 - p.trap_width / 2));
        } else {
            let size = this.get_size();
            p.pos.set_x(this.map.width / 2);
            p.resize(size);
            p.trap.set_active(false);
        }
    }

    get_size() {
        return new Vector2(this.map.width / 7, this.map.height / 40);
    }

    get_height_init() {
        return this.map.height / 3;
    }

    get_height_add() {
        return this.map.height / 3;
    }

    get_new(idx) {
        let p = null;
        if (this.nodes.size() > 0) {
            p = this.nodes.pop();
            p.set_active(true);
            p.idx = idx;
            return p;
        }
        p = new Platform(
            this.playground,
            0,
            0,
            0,
            0,
            "white",
            null,
            this.map,
        ); 
        p.idx = idx;
        let outer = this;
        p.event_manager.on("player enter", function(uid){
            outer.on_player_touch(uid, p.idx);
        });
        p.trap.event_manager.on("player enter", function(uid){
            outer.on_player_touch(uid, p.idx);
            p.set_active(false);
            if (outer.platform_socket) outer.platform_socket.send_trigger(p.idx);
            outer.event_manager.emit("trigger");
        });
        return p;
    }

    need_pop() {
        return this.platforms.front().idx < this.min_idx - 1;
    }

    need_push() {
        return this.platforms.back().idx < this.max_idx + 3;
    }

    handle_interval() {
        let count = 0;
        while(this.need_pop()) {
            this.platforms_pop();
            count ++;
        }
        if (count && this.platform_socket) this.platform_socket.send_delete(count);
        while (this.need_push()) {
            let p = this.get_new(this.platforms.back().idx + 1);
            p.pos.set_y(this.platforms.back().pos.y + this.get_height_init());
            this.reset_platform(p);
            this.platforms.push(p);
            if (this.platform_socket) this.platform_socket.send_create(p);
        }
    }
    
    handle_idx(uid, idx) {
        let found = false;
        this.min_idx = idx;
        this.max_idx = idx;
        for (let key in this.idxs) {
            if(key === uid) {
                this.idxs[key] = idx;
                found = true;
            }
            this.min_idx = Math.min(this.min_idx, this.idxs[key]);
            this.max_idx = Math.max(this.max_idx, this.idxs[key]);
        }
        if (!found) this.idxs[uid] = idx;
    }

    on_player_touch(uid, idx) {
        if (this.is_multi && this.playground.web_sockets.character === "servant") {
            if (idx != this.idx_tag) {
                this.idx_tag = idx;
                this.platform_socket.send_touch(uid, idx);
            }
            return;
        }
        if (this.idxs[uid] === idx) return;
        this.handle_idx(uid, idx);
        this.handle_interval();
    }

    on_destroy() {
        while (this.platforms.size() > 0)
            this.platforms.pop().destroy();
        while (this.nodes.size() > 0)
            this.nodes.pop().destroy();
    }

    create_platform(uid, idx, x, y, width, height, trap_x, trap_active) {
        let p = this.get_new(idx);
        p.uid = uid;
        p.pos.set(x, y);
        p.resize(new Vector2(width, height));
        p.trap.pos.set_x(trap_x);
        p.trap.set_active(trap_active);
        this.platforms.push(p);
    }

    platforms_pop() {
        let p = this.platforms.pop();
        p.set_active(false);
        this.nodes.push(p);
    }

    delete_platform(count) {
        while (count -- > 0) {
            this.platforms_pop();
        }
    }

    get_standered_height() {
        return this.platforms.at(this.platforms.size() - 2).pos.y;
    }

    reset() {
        this.idxs = [];
        this.max_idx = 0;
        this.min_idx = 0;
        if (!this.is_multi) {
            this.delete_platform(this.platforms.size());
            this.create();
        }
        else if (this.playground.web_sockets.character === "master") {
            this.platform_socket.send_delete(this.platforms.size());
            this.delete_platform(this.platforms.size());
            this.create();
            this.playground.web_sockets.send_start_game();
        }
    }
}class Trap extends GameObject {
    constructor(playground, x, y, width, height, color, image, pa = null) {
        super(pa);
        this.playground = playground;
        this.pos.set(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
        this.image = image;
        this.tag = "trap"
        this.event_manager = new EventManager();
    }

    start() {
        this.rect_collider = this.add_component(new RectCollider(this.width, this.height));
        this.rect_render = this.add_component(new RectRender(this.width, this.height, this.color, this.image, 1));
        this.rect_collider.is_trigger = true;
    }

    on_trigger_enter(collider) {
        if (collider.game_object.tag != "player" || collider.game_object.character != "player self") return;
        /*
        this.pa.on_collision_enter(collider);
        this.pa.playground.map.scoreboard.add_score(1);
        this.pa.set_active(false);
        */
        this.event_manager.emit("player enter", collider.game_object.uid);
    }

    resize(size) {
        this.width = size.x;
        this.height = size.y;
        if (this.rect_render) {
            this.rect_render.width = this.width;
            this.rect_render.height = this.height;
        }
        if (this.rect_collider) {
            this.rect_collider.width = this.width;
            this.rect_collider.height = this.height;
        }
    }
}
class Scoreboard extends GameObject {
    constructor(playground, x, y, pa) {
        super(pa);
        this.playground = playground;
        this.pos.set(x, y);
        this.score = 0;
        this.prefix = "Score: ";
        this.text = this.add_component(new Text(this.prefix + 0, "white", "center", 10));
    }

    start() {
        this.text.relation = "screen";
    }

    add_score(v) {
        this.score += v;
        this.text.text = this.prefix + this.score;
    }

    set_score(score) {
        this.score = score;
        this.text.text = this.prefix + this.score;
    }

    reset() {
        this.set_score(0);
    }
}
//A: 65
//D: 68
//w: 87
//s: 83
//space: 32
class Player extends GameObject {
    constructor(playground, x, y, radius, speed, color, username, photo, character) {
        super();
        this.playground = playground;
        this.pos.set(x, y);
        this.radius = radius;
        this.color = color;
        this.username = username;
        this.photo = photo;
        this.character = character;
        this.speed = speed;
        this.left = false;
        this.right = false;
        this.jump = false;
        this.alive = true;
        this.on_ground = false;
        this.tag = "player";

        this.width = this.radius * 2;
        this.height = this.radius * 2;

        this.camera_pos = new GameObject();
        this.is_pause = false;
        this.event_manager = new EventManager();

        this.add_collider();
        this.add_render();
        this.add_listening_event();
    }

    add_collider() {
        this.rigidbody = this.add_component(new Rigidbody());
        this.rect_collider = this.add_component(new RectCollider(this.width, this.height, 1));
    }

    add_render() {
        let layer = (this.character === "player self" ? 3 : 2);
        this.rect_render = this.add_component(new RectRender(this.width, this.height, this.color, this.photo, layer));
    }

    add_listening_event() {
        let outer = this;
        if (this.character != "player self") return;
        this.playground.$canvas.keydown(function(e){
            let flag = false; 
            if (e.which == 65) {
                if (outer.left != true) {
                    outer.left = true;
                    flag = true;
                }
            }
            else if (e.which == 68) {
                if (outer.right != true) {
                    outer.right = true;
                    flag = true;
                }
            }
            else if (e.which == 32) {
                if (outer.jump != true) {
                    outer.jump = true;
                    flag = true;
                }
            }
            if (flag) outer.event_manager.emit("state change");
        });
        this.playground.$canvas.keyup(function(e){
            let flag = true;
            if (e.which == 65) {
                if (outer.left != false) {
                    outer.left = false;
                    flag = true;
                }
            }
            else if (e.which == 68) {
                if (outer.right != false) {
                    outer.right = false;
                    flag = true;
                }
            }
            else if (e.which == 32) {
                if (outer.jump != false) {
                    outer.jump = false;
                    flag = true;
                }
            }
            if (flag) outer.event_manager.emit("state change");
        });
    }

    update() {
        this.camera_pos.pos.copy(this.pos);
        this.camera_pos.pos.set_x(this.playground.width / 2);
        this.update_state();
        this.update_move();
    }

    update_state() {
        let colliders = Physics.overlarp_rect(new Vector2(this.pos.x, this.pos.y + this.radius), this.radius / 10, this.radius / 10);
        if (colliders.length >= 1 && this.rigidbody.gravity_speed  < 0.001) this.on_ground = true;
        else this.on_ground = false;
    }

    update_move() {
        let _x = this.pos.x, _y = this.pos.y;
        if (this.left) _x -= this.speed * Time.deltaTime;
        if (this.right) _x += this.speed * Time.deltaTime;
        if (this.on_ground && this.jump) {
            this.rigidbody.gravity_speed -= 0.3;
            this.on_ground = false;
        }
        if (!this.is_out_of_bounds(_x))
            this.rigidbody.move_position(_x, _y);
    }

    is_out_of_bounds(x) {
        return x < this.width / 2 || x > this.playground.width - this.width / 2;
    }

    set_pause(is_pause) {
        if (this.is_pause == is_pause) return;
        this.is_pause = is_pause;
        this.rigidbody.enable = !is_pause;
        this.left = this.right = this.jump = false;
    }

    reset() {
        this.rigidbody.gravity_speed = 0;
        this.left = this.right = this.jump = false;
        this.alive = true;
    }
}
class PlayerManager extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.event_manager = new EventManager();
        this.is_multi = (this.playground.mode === "multi");
        if (this.is_multi) this.player_socket = new PlayerSocket(this);
        this.awake();
    }

    awake() {
        this.set_parameters();
        this.players_init();
    }

    set_parameters() {
        this.player_radius = this.playground.height / 32;
        this.player_speed = 0.4;
        this.player_color = "orange";
    }

    players_init() {
        this.players = [];
        this.self_index = -1;
    }

    set_pause_all(is_pause) {
        for (let i = 0; i < this.players.length; i ++)
            this.players[i].set_pause(is_pause);
    }

    add_player(x, y, username, photo, character = "player self", uid = null) {
        let new_player = new Player(
            this.playground, 
            x, 
            y, 
            this.player_radius, 
            this.player_speed, 
            this.player_color, 
            username, 
            photo, 
            character
        );
        if (uid) new_player.uid = uid;
        if (character === "player self") {
            this.self_index = this.players.length;
            if (this.is_multi) {
                this.player_socket.send_create_player(
                    new_player.uid,
                    x,
                    y,
                    username,
                    photo
                );
            }
            this.event_manager.emit("add self player", new_player);
        }
        if (this.is_multi) new_player.set_pause(true); 
        this.players.push(new_player);
    }

    update_player(uid, left, right, jump, alive) {
        for (let i = 0; i < this.players.length; i ++) {
            let player = this.players[i];
            if (player.uid != uid) continue;
            player.left = left;
            player.right = right;
            player.jump = jump;
            if (alive === false) this.players.splice(i, 1);
            break;
        }
    }

    self_player() {
        if (this.self_index >= 0 && this.self_index < this.players.length)
            return this.players[this.self_index];
        return null;
    }

    on_destroy() {
        this.multi_player_socket = null;
        for (let i = 0; i < this.players.length; i ++)
            this.players[i].destroy();
        this.players = null;
    }
}class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="fuckjump-playground"></div>`);
        this.$canvas = $(`<canvas tabindex="0"></canvas>`);
        this.ctx = this.$canvas[0].getContext("2d");
        this.$playground.append(this.$canvas);
        this.root.$main_object.append(this.$playground);
        this.scale_width = 14;
        this.scale_height = 16;
        this.$playground.hide();
        this.menu = new PlaygroundMenu(this);
        this.start();
    }

    start() {
        this.resize();
    }

    add_listening_events() {
        let outer = this;
        this.$canvas.on("contextmenu", function(){
            return false;
        });
        this.$canvas.focus(function(){
            outer.set_pause(false);
        });
        this.$canvas.blur(function(){
            outer.set_pause(true);
        });
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / this.scale_width, this.height / this.scale_height);
        this.scale = unit * this.scale_height;
        this.ctx.canvas.width = unit * this.scale_width;
        this.ctx.canvas.height = unit * this.scale_height;
        this.width = this.scale_width / this.scale_height;
        this.height = 1;
    }

    show(mode = "single") {
        this.mode = mode;
        if (this.mode === "multi") this.web_sockets = new WebSockets(this);
        this.$playground.show();
        this.resize();
        this.camera = new Camera(this);
        this.background = new Background(this);
        this.create_player();
        this.camera.set_follow(this.player_manager.self_player().camera_pos);
        this.map_manager = new MapManager(this);
        this.add_listening_events();
    }

    create_player() {
        this.player_manager = new PlayerManager(this);
        this.player_manager.add_player(
            this.width / 2,
            0,
            // this.root.settings.username,
            // this.root.settings.photo
            "yuxiaoguo",
            null
        );
    }

    hide() {
        this.$playground.hide();
        this.background.destroy();
        this.player_manager.destroy();
        this.map_manager.destroy();
        this.camera = null;
        this.background = null;
        this.player_manager = null;
        this.map_manager = null;
    }

    quit() {
        this.hide();
        this.root.menu.show();
    }

    set_pause(is_pause) {
        if (this.mode === "multi") return;
        if (this.is_pause == is_pause) return;
        this.is_pause = is_pause;
        Time.set_pause(is_pause);
        if (this.map_manager) this.map_manager.set_pause(is_pause);
    }
}
class PlaygroundMenu {
    constructor(playground) {
        this.playground = playground;
        this.$playground_menu = $(`
<div class="fuckjump-playground-menu">
    <div class="fuckjump-playground-menu-field">
        <div class="fuckjump-playground-menu-field-continue">
            <div class="fuckjump-playground-menu-field-item">
                Continue
            </div>
        </div>
        <br>
        <div class="fuckjump-playground-menu-field-restart">
            <div class="fuckjump-playground-menu-field-item">
                Restart
            </div>
        </div>
        <br>
        <div class="fuckjump-playground-menu-field-quit">
            <div class="fuckjump-playground-menu-field-item">
                Quit
            </div>
        </div>
    </div>
</div>
`);
        this.playground.$playground.append(this.$playground_menu);
        this.$continue = this.$playground_menu.find(".fuckjump-playground-menu-field-continue");
        this.$restart = this.$playground_menu.find(".fuckjump-playground-menu-field-restart");
        this.$quit = this.$playground_menu.find(".fuckjump-playground-menu-field-quit");
        this.is_visible = false;
        this.hide();
        this.start();
    }

    start() {
        this.add_listening_events();        
    }

    add_listening_events() {
        let outer = this;
        this.playground.$canvas.keydown(function(e){
            if (e.which === 27) {
                if (outer.is_visible === false)
                    outer.change_visible();
            }
        });
        this.$continue.click(function(e){
            outer.change_visible();
        });
        this.$restart.click(function(e){
            outer.change_visible();
            outer.playground.map_manager.map.reset();
        });
        this.$quit.click(function(e){
            outer.change_visible();
            outer.playground.map_manager.map.settlement();
            outer.playground.quit();
        })
    }

    show() {
        this.$playground_menu.show();
    }

    hide() {
        this.$playground_menu.hide();
    }

    change_visible() {
        if (this.is_visible) {
            this.is_visible = false;
            this.hide();
            this.playground.$canvas.focus();
        } else {
            this.is_visible = true;
            this.show();
        }
        this.playground.set_pause(this.is_visible);
    }
}class WebSockets {
    constructor(playground) {
        this.playground = playground;
        this.url = "ws://101.200.142.161:8000/FuckJump/multiplayer/";
        this.ws = new WebSocket(this.url);
        this.character = "servant";
        this.event_manager = new EventManager();
        this.start();
    }

    start() {
        this.init();        
        this.add_listening_events();
    }

    init() {
        this.sockets = [];
        this.sockets["main"] = this;
        this.id = "";
        for (let i = 0; i < 12; i ++)
            this.id += Math.floor(Random.random(0, 10));
    }

    add_listening_events() {
        let outer = this;
        this.ws.onmessage = function(text) {
            let data = JSON.parse(text.data);
            if (data.socket_id === outer.id) return;
            outer.sockets[data.socket_tag].receive(data);
        }
    }

    register(socket) {
        let outer = this;
        this.sockets[socket.tag] = socket;
        socket.send = function(data) {
            data.socket_tag = socket.tag;
            outer.send(data);
        }
    }

    send(data) {
        data.socket_id = this.id;
        let outer = this;
        let f = function() {
            outer.ws.send(JSON.stringify(data));
        }
        if (this.ws.readyState === 1) f();
        else this.ws.addEventListener("open", f);
    }

    receive(data) {
        let event = data.event;
        if (event === "change character") {
            this.character = data.character;
            this.event_manager.emit("change character", data.character);
        } else if (event === "start game") {
            this.sockets["player"].start_game();
        } 
    }

    send_start_game() {
        this.sockets["player"].start_game();
        this.send({
            "socket_tag": "main",
            "event": "start game"
        });
    }

    destroy() {
        this.sockets = null;
    }
}class PlatformSocket {
    constructor(platform_manager) {
        this.platform_manager = platform_manager;
        this.playground = this.platform_manager.playground;
        this.tag = "platform";
        this.awake();
    }

    awake() {
        this.playground.web_sockets.register(this);
    }

    receive(data) {
        let event = data.event;
        console.log(event);
        if (event === "create") this.receive_create(data);
        else if (event === "delete") this.receive_delete(data);
        else if (event === "touch") this.receive_touch(data);
        else if (event === "trigger") this.receive_trigger(data);
    }

    send_create(p) {
        this.send({
            "event" : "create",
            "uid": p.uid,
            "idx": p.idx,
            "x": p.pos.x,
            "y": p.pos.y,
            "width": p.width,
            "height": p.height,
            "trap_x" : p.trap.pos.x,
            "trap_active": p.trap.active
        });
    }

    receive_create(data) {
        this.platform_manager.create_platform(
            data.uid,
            data.idx,
            data.x,
            data.y,
            data.width,
            data.height,
            data.trap_x,
            data.trap_active
        );
    }

    send_delete(count) {
        this.send({
            "event": "delete",
            "count": count
        });
    }

    receive_delete(data) {
        this.platform_manager.delete_platform(data.count);
    }

    send_touch(uid, idx) {
        if (this.playground.web_sockets.character === "master") return;
        this.send({
            "event": "touch",
            "uid": uid,
            "idx": idx
        });
    }

    receive_touch(data) {
        if (this.playground.web_sockets.character === "servant") return;
        this.platform_manager.on_player_touch(data.uid, data.idx);
    }

    send_trigger(idx) {
        this.send({
            "event": "trigger",
            "idx": idx
        });
    }

    receive_trigger(data) {
        let idx = data.idx;
        let platforms = this.platform_manager.platforms;
        platforms.at(idx - platforms.front().idx).set_active(false);
        this.platform_manager.event_manager.emit("trigger");
    }
}class PlayerSocket {
    constructor(player_manager) {
        this.player_manager = player_manager;
        this.playground = player_manager.playground;
        this.tag = "player";
        this.awake();
    }

    awake() {
        this.playground.web_sockets.register(this);
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.player_manager.event_manager.on("add self player", function(player){
            player.set_pause(true);
            player.event_manager.on("state change", function(){
                    let player = outer.player_manager.self_player();
                    outer.send_update_player(
                        player.uid,
                        player.left, 
                        player.right, 
                        player.jump, 
                        player.alive
                    );
            });
        });
    }

    receive(data) {
        let event = data.event;
        if (event === "create_player") {
            this.receive_create_player(
                data.uid,
                data.x,
                data.y,
                data.username,
                data.photo
            );
        } else if (event === "update_player") {
            this.receive_update_player(
                data.uid,
                data.left,
                data.right,
                data.jump,
                data.alive
            );
        } 
    }

    send_create_player(uid, x, y, username, photo) {
       this.send({
                "event": "create_player",
                "uid": uid,
                "x": x,
                "y": y,
                "username": username,
                "photo": photo,
        });
    }

    receive_create_player(uid, x, y, username, photo) {
        this.player_manager.add_player(x, y, username, photo, "player other", uid);
    }

    send_update_player(uid, left, right, jump, alive) {
       this.send({
            "event": "update_player",
            "uid": uid,
            "left": left,
            "right": right,
            "jump": jump,
            "alive": alive
       })
    }

    receive_update_player(uid, left, right, jump, alive) {
        this.player_manager.update_player(uid, left, right, jump, alive);
    }

    start_game() {
        this.player_manager.set_pause_all(false);
    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.$settings = $(`
<div class="fuckjump-settings">
    <div class="fuckjump-settings-login">
        <div class="fuckjump-settings-title">
            Login
        </div>
        <div class="fuckjump-settings-username">
            <div class="fuckjump-settings-item">
                <input type="text" placeholder="Username">
            </div>
        </div>
        <div class="fuckjump-settings-password">
            <div class="fuckjump-settings-item">
                <input type="password" placeholder="Password">
            </div>
        </div>
        <div class="fuckjump-settings-submit">
            <div class="fuckjump-settings-item fuckjump-settings-item-hover">
                <button>Submit</button>
            </div>
        </div>
        <div class="fuckjump-settings-error-message">
        </div>
        <div class="fuckjump-settings-option fuckjump-settings-item-hover">
            Register
        </div>
    </div>

    <div class="fuckjump-settings-register">
        <div class="fuckjump-settings-title">
            Register
        </div>
        <div class="fuckjump-settings-username">
            <div class="fuckjump-settings-item">
                <input type="text" placeholder="Username">
            </div>
        </div>
        <div class="fuckjump-settings-password fuckjump-settings-password-first">
            <div class="fuckjump-settings-item">
                <input type="password" placeholder="Password">
            </div>
        </div>
        <div class="fuckjump-settings-password fuckjump-settings-password-second">
            <div class="fuckjump-settings-item">
                <input type="password" placeholder="Comfirm Password">
            </div>
        </div>
        <div class="fuckjump-settings-submit">
            <div class="fuckjump-settings-item fuckjump-settings-item-hover">
                <button>Submit</button>
            </div>
        </div>
        <div class="fuckjump-settings-error-message">
        </div>
        <div class="fuckjump-settings-option fuckjump-settings-item-hover">
            Login
        </div>
    </div>
</div>
`);
        this.root.$main_object.append(this.$settings);
        this.$login = this.$settings.find(".fuckjump-settings-login");
        this.$login_username = this.$login.find(".fuckjump-settings-username input");
        this.$login_password = this.$login.find(".fuckjump-settings-password input");
        this.$login_submit = this.$login.find(".fuckjump-settings-submit button");
        this.$login_error_message = this.$login.find(".fuckjump-settings-error-message");
        this.$login_option_register = this.$login.find(".fuckjump-settings-option");
        this.$register = this.$settings.find(".fuckjump-settings-register");
        this.$register_username = this.$register.find(".fuckjump-settings-username input");
        this.$register_password_1 = this.$register.find(".fuckjump-settings-password-first input");
        this.$register_password_2 = this.$register.find(".fuckjump-settings-password-second input");
        this.$register_submit = this.$register.find(".fuckjump-settings-submit button");
        this.$register_error_message = this.$register.find(".fuckjump-settings-error-message");
        this.$register_option_login = this.$register.find(".fuckjump-settings-option");

        this.on_user_get = null;
        this.username = null;

        this.hide();

        this.start();
    }

    start() {
        this.add_listening_events();
        this.getinfo_on_remote();
    }

    add_listening_events() {
        this.add_login_listening_events();
        this.add_register_listening_events();
    }

    add_login_listening_events() {
        let outer = this;
        this.$login_option_register.click(function(){
            outer.$login_error_message.html("");
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.$login_error_message.html("");
            outer.login_on_remote();
        });
    }

    add_register_listening_events() {
        let outer = this;
        this.$register_option_login.click(function(){
            outer.$register_error_message.html("");
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.$register_error_message.html("");
            outer.register_on_remote();
        });
    }

    show() {
        this.$settings.show();
        this.login();
    }

    hide() {
        this.$settings.hide();
    }

    login() {
        this.$login.show();
        this.$register.hide();
    }

    register() {
        this.$login.hide();
        this.$register.show();
    }

    getinfo_on_remote() {
        let outer = this;
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/getinfo/",
            type: "GET",
            success: function(resp) {
                let res = resp.result;
                if (res === "success") {
                    if (outer.on_user_get) {
                        outer.username = resp.username;
                        outer.openid = resp.openid;
                        if (resp.photo != "") outer.photo = resp.photo;
                        else outer.photo = null;
                        outer.max_score = resp.max_score;
                        outer.on_user_get();
                    }
                } else {
                    outer.show();
                }
            }
        });
    }

    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                let res = resp.result;
                if (res === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(res);
                }
            }
        });
    }

    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password_1 = this.$register_password_1.val();
        let password_2 = this.$register_password_2.val();
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/register/",
            type: "GET",
            data: {
                username: username,
                password_1: password_1,
                password_2: password_2,
            },
            success: function(resp) {
                let res = resp.result;
                if (res != "success") {
                    outer.$register_error_message.html(res);
                } else {
                    location.reload();
                }
            }
        });
    }

    logout_on_remote() {
        let outer = this;
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/logout/",
            type: "GET",
            success: function(resp) {
                location.reload();
            }
        });
    }

    update_max_score(score) {
        if (score <= this.max_score) return;
        let outer = this;
        $.ajax({
            url: "http://101.200.142.161:8000/Jump/settings/update_info/",
            type: "GET",
            data: {
                max_score: score,
            },
            success: function(resp) {
                let res = resp.result;
                if (res === "success") {
                    outer.max_score = score; 
                }
            }
        });
    }

    set_on_user_get(f) {
        if (this.username) f();
        else this.on_user_get = f;
    }
}
