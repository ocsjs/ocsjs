import { SemVer, valid, coerce, clean, lt, gt } from "semver";

/**
 * 版本号类
 */
export class Version {
    private _value: SemVer;

    public get value(): SemVer {
        return this._value;
    }
    public set value(value: SemVer) {
        this._value = value;
    }

    constructor(version: string) {
        this._value = new SemVer(valid(coerce(clean(version, { loose: true }))) || "0.0.0");
    }
    lessThan(v: Version) {
        return lt(this.value, v.value);
    }
    greaterThan(v: Version) {
        return gt(this.value, v.value);
    }

    toString() {
        return this.value.raw;
    }

    static from(version: string) {return new Version(version)}
}
