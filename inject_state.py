import re

with open('src/app/(tabs)/activity.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_injection = '''
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trekName, setTrekName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSubmitModal = (id: string) => {
    setSelectedRouteId(id);
    setTrekName('');
    setDifficulty('Medium');
    setSubmitModalVisible(true);
  };

  const submitRouteForApproval = async () => {
    if (!trekName.trim()) {
      Alert.alert('Error', 'Please enter a trek name.');
      return;
    }
    setIsSubmitting(true);
    // Use description to track pending state to avoid schema errors
    const pendingText = '[PENDING_APPROVAL] ' + trekName + ' - ' + difficulty;
    
    const { error } = await supabase
      .from('routes')
      .update({ description: pendingText, difficulty_self_rating: difficulty })
      .eq('id', selectedRouteId);
      
    setIsSubmitting(false);
    
    if (error) {
      Alert.alert('Error', 'Failed to submit route.');
    } else {
      Alert.alert('Success', 'Route submitted for Admin review!');
      setSubmitModalVisible(false);
      fetchMyRoutes();
    }
  };
'''

content = content.replace('  const router = useRouter();', '  const router = useRouter();\n' + state_injection)

with open('src/app/(tabs)/activity.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("State and functions added.")
