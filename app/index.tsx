import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// TODO: Importar expo-camera, expo-location e async-storage

interface Segredo  {
        id: string,
        texto: string,
        fotoUri: string,
        latitude: string,
        longitude: string
      }

export default function NovoSegredoScreen() {
  const [texto, setTexto] = useState('');
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

// TESTE CAMERAREF
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
 
 
  // Lógica do botão de abrir câmera
  // EQUIVALENTE A openCamera
  const handleAbrirCamera = async () => {
    // TODO 1: Pedir permissão da câmera
    // Se permitido, abrir a câmera mudando o estado:
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if(!permission.granted) return;
    }    
    setIsCameraOpen(true);
  };

  // Lógica após tirar a foto
  const handleTirarFoto = async () => {
    // TODO 2: Usar o cameraRef para tirar a foto
    // Salvar a URI no estado setFotoUri e fechar a câmera
    if(cameraRef.current) {
        const photoData = await cameraRef.current.takePictureAsync();
        setFotoUri(photoData.uri);
        setIsCameraOpen(false);
    }
  };

  
  // Lógica de salvar no armazenamento local
  const handleSalvarSegredo = async () => {
    if (!texto) {
      Alert.alert('Erro', 'Digite um segredo primeiro!');
      return;
    }

    // TODO 3: Buscar a localização atual do usuário (GPS)
      //3.1 PEDE PERMISSÃO
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de localização negada!');
      return;
    }
      //3.2  CAPTURA LOCALIZAÇÃO
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível obter localização');
      }
      

    // TODO 4: Montar o objeto do segredo e salvar no AsyncStorage
    Alert.alert("Sucesso", "Implemente o AsyncStorage aqui!");
      
    if(!location) {
      Alert.alert("Erro", "Localização não disponível");
    }
    
    const novoSegredo:Segredo = {
        id: Date.now().toString(),
        texto: texto,
        fotoUri: fotoUri ?? '',
        latitude: location!.latitude.toString(),
        longitude: location!.longitude.toString()
      }

      Alert.alert ("teste", JSON.stringify(novoSegredo));
      
      const storeData = async (novoSegredo:Segredo) => {
        try {
          const novoSegredoString = JSON.stringify(novoSegredo);
          await AsyncStorage.setItem(novoSegredo.id, novoSegredoString)
        } catch (e) {
          Alert.alert("Erro", "Ocorreu um erro ao salvar o segredo!");
        }
      }      
      
    setTexto('');
    setFotoUri(null);
  };

  // --- RENDERIZAÇÃO DA CÂMERA EM TELA CHEIA ---
  if (isCameraOpen) {
    return (
      <View style={styles.container}>
        {/* <Text style={{ color: '#fff', marginTop: 50, textAlign: 'center' }}> */}
          {/* TODO: Substituir esta View pelo componente <CameraView> */}
          {/* (Câmera deve aparecer aqui) */}
        {/* </Text> */}
        <CameraView style={{flex: 1}} ref={cameraRef} facing="back">
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.btnCapturar} onPress={handleTirarFoto}>
              <Text style={styles.btnText}>Capturar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setIsCameraOpen(false)}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // --- RENDERIZAÇÃO DO FORMULÁRIO NORMAL ---
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Qual o seu segredo neste local?</Text>

      <TextInput
        style={styles.input}
        placeholder="Escreva algo marcante..."
        placeholderTextColor="#666"
        value={texto}
        onChangeText={setTexto}
        multiline
      />

      <View style={styles.fotoContainer}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.previewFoto} />
        ) : (
          <TouchableOpacity style={styles.btnFotoOutline} onPress={handleAbrirCamera}>
            <Text style={styles.btnFotoText}>📷 Adicionar Foto ao Segredo</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarSegredo}>
        <Text style={styles.btnSalvarText}>Salvar Segredo e Localização 📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 20 },
  label: { color: '#fff', fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  input: { backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 8, minHeight: 100, textAlignVertical: 'top' },
  fotoContainer: { marginVertical: 20, alignItems: 'center' },
  previewFoto: { width: '100%', height: 200, borderRadius: 8 },
  btnFotoOutline: { borderWidth: 1, borderColor: '#007bff', borderStyle: 'dashed', padding: 30, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnFotoText: { color: '#007bff', fontSize: 16 },
  btnSalvar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cameraOverlay: { flex: 1, justifyContent: 'space-evenly', paddingBottom: 40, flexDirection: 'row', alignItems: 'flex-end' },
  btnCapturar: { backgroundColor: '#28a745', padding: 15, borderRadius: 30 },
  btnCancelar: { backgroundColor: '#dc3545', padding: 15, borderRadius: 30 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
