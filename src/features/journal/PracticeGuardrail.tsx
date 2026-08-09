interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function PracticeGuardrail({ label, checked, onChange }: Props) {
  return (
    <fieldset className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
      <legend className="px-1 text-[10px] font-black text-amber-700">开始前的选择</legend>
      <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-5 text-brand-600">
        <input
          type="checkbox"
          checked={checked}
          onChange={event => onChange(event.target.checked)}
          className="mt-1 accent-amber-600"
        />
        <span>
          我现在处在安全、清醒且适合练习的环境，并愿意尝试这次{label}。我知道体验可以是部分或混合的，不需要追求黑屏、失忆或完全失去控制；我和 Ta 都可以随时暂停并回到当下。
        </span>
      </label>
    </fieldset>
  );
}
