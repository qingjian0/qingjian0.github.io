import 'package:flutter/material.dart';
import 'package:workspace/core/constants/ai_urls.dart';

class ModelSwitcher extends StatelessWidget {
  final String currentModel;
  final ValueChanged<String> onModelChanged;
  
  const ModelSwitcher({super.key, required this.currentModel, required this.onModelChanged});
  
  @override
  Widget build(BuildContext context) {
    return DropdownButton<String>(
      value: currentModel,
      onChanged: (String? newValue) {
        if (newValue != null) {
          onModelChanged(newValue);
        }
      },
      items: AiUrls.models.keys.map((model) {
        return DropdownMenuItem<String>(
          value: model,
          child: Text(model),
        );
      }).toList(),
    );
  }
}