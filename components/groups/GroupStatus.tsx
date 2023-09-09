interface GroupStatusProps {
  status: string;
}

const labels: Record<string, string> = {
  open: 'Looking for members',
  active: 'Active',
  completed: 'Completed',
};

const colors: Record<string, string> = {
  open: 'bg-neutral-700 text-white',
  active: 'bg-orange-500 text-white',
  completed: 'bg-green-700 text-white',
};

const GroupStatus: React.FC<GroupStatusProps> = ({ status }) => {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

export default GroupStatus;
