const { valid, coerce, clean, lt, gt, SemVer } = require("semver");
/**
 * 版本号类
 */
export class Version {
    private _value: any;

    public get value(): any {
        return this._value;
    }
    public set value(value: any) {
        this._value = value;
    }

    constructor(version: string) {
        this._value = new SemVer(valid(coerce(clean(version, { loose: true }))) || "0.0.0");
    }
    lessThan(v: Version): boolean {
        return lt(this.value, v.value);
    }
    greaterThan(v: Version): boolean {
        return gt(this.value, v.value);
    }

    toString(): string {
        return this.value.raw;
    }

    static from(version: string): any {
        return new Version(version);
    }
}
