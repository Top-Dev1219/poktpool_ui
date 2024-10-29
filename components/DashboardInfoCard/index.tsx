interface InfoCardProps {
  label: string
  value: string | number
}

export const DashboardInfoCard = (props: InfoCardProps) => {
  const { label, value } = props

  return (
    <div className="p-6 rounded drop-shadow-xl bg-slate-100">
      <p className="text-slate-700 my-0">{label}</p>
      <h3 className="text-black text-3xl font-bold my-0 heading-number-tag">
        {value} <span className="text-sm font-normal">POKT</span>
      </h3>
    </div>
  )
}
