import ServerConstants from "./ServerConstants";

export class Point {
    public x: number;
    public y: number;

    constructor(_x: number = 0, _y: number = 0) {
        this.x = _x;
        this.y = _y;
    }

    public Clone(): Point {
        return new Point(this.x, this.y);
    }

    CutBorderWord(offset: number = 0): Point {
        return new Point(
            Math.min(ServerConstants.World.Width - offset, Math.max(0 + offset, this.x)),
            Math.min(ServerConstants.World.Height - offset, Math.max(0 + offset, this.y))
        );
    }

    public Add(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public Sub(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    public Mult(alpha: number): Point {
        return new Point(this.x * alpha, this.y * alpha)
    }

    public Equal(other: Point): boolean {
        return (
            Math.abs(this.x - other.x) < ServerConstants.EPS &&
            Math.abs(this.y - other.y) < ServerConstants.EPS
        );
    }

    public Norm(): number {
        return Math.hypot(this.x, this.y);
    }

    public Normalized(): Point {
        const norma = this.Norm();
        if (norma === 0.0)
            return new Point(0, 0);
        return this.Mult(1.0 / norma);
    }

    public angle(): number {
        return Math.atan2(this.y, this.x);
    }

    public PolarAngle(): number {
        const a: number = Math.atan2(this.y, this.x);
        return a < 0 ? a + 2 * Math.acos(-1.0) : a;
    }
}

export class Circle {
    center: Point;
    raio: number;

    constructor(_center: Point = new Point(), _raio: number = 0) {
        this.center = _center;
        this.raio = _raio;
    }

    area(): number {
        return Math.acos(-1.0) * this.raio * this.raio;
    }

    intersects(other: Circle): boolean {
        return Dist(this.center, other.center) < this.raio + other.raio;
    }

    contains(p: Point): boolean {
        return Dist(this.center, p) <= this.raio + ServerConstants.EPS;
    }
}

export function Dist(p1: Point, p2: Point): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function Inner(p1: Point, p2: Point): number {
    return p1.x * p2.x + p1.y * p2.y;
}

export function Cross(p1: Point, p2: Point): number {
    return p1.x * p2.y - p1.y * p2.x;
}

export function Ccw(p: Point, q: Point, r: Point): boolean {
    return Cross(q.Sub(p), r.Sub(p)) > 0;
}

export function Collinear(p: Point, q: Point, r: Point): boolean {
    return Math.abs(Cross(p.Sub(q), r.Sub(p))) < ServerConstants.EPS;
}

export function Rotate(p: Point, rad: number): Point {
    return new Point(p.x * Math.cos(rad) - p.y * Math.sin(rad),
        p.x * Math.sin(rad) + p.y * Math.cos(rad));
}

export function Angle(a: Point, o: Point, b: Point): number {
    return Math.acos(
        Inner(a.Sub(o), b.Sub(o)) / (Dist(o, a) * Dist(o, b))
    );
}

export function Proj(u: Point, v: Point): Point {
    return v.Mult(Inner(u, v) / Inner(v, v));
}

export function Between(p: Point, q: Point, r: Point): boolean {
    return Collinear(p, q, r) && Inner(p.Sub(q), r.Sub(q)) <= 0;
}

export function LineIntersectSeg(p: Point, q: Point, A: Point, B: Point): Point {
    const c: number = Cross(A.Sub(B), p.Sub(q));
    const a: number = Cross(A, B);
    const b: number = Cross(p, q);
    return p.Sub(q).Mult(a / c)
        .Sub(
            A.Sub(B).Mult(b / c)
        );
}

export function Parallel(a: Point, b: Point): boolean {
    return Math.abs(Cross(a, b)) < ServerConstants.EPS;
}