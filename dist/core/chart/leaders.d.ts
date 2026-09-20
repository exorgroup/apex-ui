export interface LeaderLabel {
    key: string;
    /** On the slice's own rim, at its mid-angle. */
    ax: number;
    ay: number;
    /** The elbow, just outside the rim. */
    ex: number;
    ey: number;
    /** Where the text sits, after displacement. */
    tx: number;
    ty: number;
    anchor: 'start' | 'end';
    side: 'left' | 'right';
    text: string;
}
export interface LeaderInput {
    cx: number;
    cy: number;
    /** Rim radius the connector starts from. */
    r: number;
    /** How far past the rim the elbow sits. */
    elbow?: number;
    /** Horizontal run from elbow to text. */
    run?: number;
    /** Minimum vertical gap between two labels on the same side. */
    gap?: number;
    /** Clamp box, so a displaced label cannot leave the plot. */
    bounds?: {
        top: number;
        bottom: number;
    };
    /** Keeps the radial elbow instead of levelling it with the text. */
    straight?: boolean;
}
export declare function leaderLabels(items: {
    key: string;
    mid: number;
    text: string;
}[], input: LeaderInput): LeaderLabel[];
