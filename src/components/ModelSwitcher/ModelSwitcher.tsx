

interface ModelSwitcherProps {
  currentModel: string
  onModelChange: (model: string) => void
  models: Record<string, string>
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  currentModel, 
  onModelChange, 
  models 
}) => {
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value)
  }

  return (
    <div className="model-switcher">
      <label htmlFor="model-select">AI模型:</label>
      <select 
        id="model-select" 
        value={currentModel} 
        onChange={handleModelChange}
      >
        {Object.keys(models).map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ModelSwitcher