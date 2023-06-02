export const predicateLog = (key: string, value: string) => (action: any) => {
  return action.type === 'PUSH_LOG' && action.payload[key] === value;
};
