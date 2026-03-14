function LampIllustration({ lampOn, threadPulled, onPull, buttonLabel = 'Pull' }) {
    const buttonBase =
        'mt-1 min-w-11 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em] transition duration-200';

    return (
        <div className="relative mt-4 h-[220px] w-[220px]" aria-hidden="true">
            <div
                className={`absolute left-[42px] top-[90px] z-10 flex origin-top flex-col items-center transition-transform duration-200 ${threadPulled ? '-translate-x-1 translate-y-3 rotate-[6deg]' : ''
                    }`}
            >
                <span className="h-[90px] w-[2px] origin-top rotate-[13deg] rounded bg-gradient-to-b from-stone-50 to-stone-300" />
                {onPull ? (
                    <button
                        type="button"
                        onClick={onPull}
                        aria-label="Pull lamp thread"
                        className={`${buttonBase} border-slate-200/50 bg-gradient-to-b from-slate-100 to-slate-300 text-slate-900 hover:-translate-y-0.5 hover:brightness-105`}
                    >
                        {buttonLabel}
                    </button>
                ) : (
                    <span className={`${buttonBase} border-slate-200/50 bg-gradient-to-b from-slate-100 to-slate-300 text-slate-900`}>
                        {buttonLabel}
                    </span>
                )}
            </div>

            <div className="absolute left-[52px] top-[18px] h-[86px] w-[116px] rounded-[52%_52%_44%_44%] bg-gradient-to-br from-slate-500 via-slate-700 to-slate-950 shadow-[inset_-10px_-16px_20px_rgba(0,0,0,0.35),inset_9px_9px_14px_rgba(255,255,255,0.06)]" />
            <div className="absolute left-[66px] top-[70px] h-[30px] w-[88px] rounded-b-[42px] bg-gradient-to-b from-amber-50 to-amber-200 drop-shadow-[0_0_6px_rgba(255,233,166,0.55)]" />
            <div className="absolute left-[102px] top-[95px] h-[66px] w-3 rounded-[10px] bg-gradient-to-b from-slate-100 to-slate-300" />
            <div className="absolute left-[70px] top-[158px] h-5 w-[78px] rounded-full bg-gradient-to-b from-slate-50 to-slate-300 shadow-[0_8px_20px_rgba(0,0,0,0.38)]" />

            <div
                className={`absolute left-[28px] top-[86px] h-[128px] w-[164px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,240,171,0.96),rgba(255,236,167,0.2)_64%,transparent_84%)] [clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)] transition duration-300 ${lampOn ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            <span className="absolute left-[85px] top-[58px] h-[5px] w-[11px] rounded-full border-b-2 border-slate-900" />
            <span className="absolute right-[85px] top-[58px] h-[5px] w-[11px] rounded-full border-b-2 border-slate-900" />
            <span
                className={`absolute left-[102px] top-[76px] h-[6px] w-3 rounded-b-[10px] border-b-2 border-slate-900 transition duration-200 ${lampOn ? 'opacity-100' : 'opacity-0'
                    }`}
            />
            <span
                className={`absolute left-[106px] top-[79px] h-[7px] w-2 rounded-b-[8px] bg-gradient-to-b from-rose-400 to-rose-700 transition duration-200 ${lampOn ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}

export default LampIllustration;