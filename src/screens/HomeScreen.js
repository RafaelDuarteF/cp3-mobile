import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  FlatList,
  Keyboard,
} from "react-native";
import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../firebase/productService";

export default function HomeScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [location, setLocation] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  async function loadProducts() {
    try {
      const productList = await getProducts();
      setProducts(productList);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (route.params?.scannedBarcode) {
      setName(route.params.currentName || "");
      setPrice(route.params.currentPrice || "");
      setBarcode(String(route.params.scannedBarcode));
      setLocation(route.params.scannedLocation || null);
    }
  }, [route.params?.scannedBarcode]);

  function clearForm() {
    setName("");
    setPrice("");
    setBarcode("");
    setLocation(null);
    setEditingProductId(null);
  }

  function formatPriceBR(value) {
    const onlyNumbers = value.replace(/\D/g, "");

    if (!onlyNumbers) {
      return "";
    }

    const numberValue = Number(onlyNumbers) / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handlePriceChange(text) {
    const formattedPrice = formatPriceBR(text);
    setPrice(formattedPrice);
  }

  async function handleSaveProduct() {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Atenção", "Preencha nome e preço do produto.");
      return;
    }

    const productData = {
      name: name.trim(),
      price: price.trim(),
      barcode: barcode ? String(barcode).trim() : "",
      ...(location && { location }),
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productData);
        Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      } else {
        await createProduct(productData);
        Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      }

      clearForm();
      await loadProducts();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    }
  }

  function handleEditProduct(product) {
    setName(product.name || "");
    setPrice(product.price || "");
    setBarcode(product.barcode || "");
    setLocation(product.location || null);
    setEditingProductId(product.id);
  }

  function handleCancelEdit() {
    clearForm();
  }

  async function handleDeleteProduct(productId) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (!confirmDelete) return;

    try {
      await deleteProduct(productId);

      if (editingProductId === productId) {
        clearForm();
      }

      Alert.alert("Sucesso", "Produto excluído com sucesso!");
      await loadProducts();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    }
  }

  function handleOpenScanner() {
    navigation.navigate("BarcodeScanner", {
      currentName: name,
      currentPrice: price,
      currentBarcode: barcode,
    });
  }

  function renderHeader() {
    return (
      <View>
        <Text style={{ fontSize: 24, marginTop: 40, marginBottom: 20 }}>
          Bem-vindo!
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Button title="Ler código de barras" onPress={handleOpenScanner} />
        </View>

        <TextInput
          placeholder="Nome do produto"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <TextInput
          placeholder="Preço"
          value={price}
          onChangeText={handlePriceChange}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={true}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <TextInput
          placeholder="Código de barras"
          value={barcode}
          onChangeText={setBarcode}
          style={{
            borderWidth: 1,
            marginBottom: 20,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <Button
          title={editingProductId ? "Atualizar produto" : "Cadastrar produto"}
          onPress={handleSaveProduct}
        />

        {editingProductId && (
          <View style={{ marginTop: 10 }}>
            <Button title="Cancelar edição" onPress={handleCancelEdit} />
          </View>
        )}

        <Text style={{ fontSize: 20, marginTop: 30, marginBottom: 10 }}>
          Produtos cadastrados
        </Text>
      </View>
    );
  }

  function renderFooter() {
    return (
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Button title="Sair" onPress={() => navigation.navigate("Login")} />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View>{renderHeader()}</View>}
      ListEmptyComponent={<Text>Nenhum produto cadastrado.</Text>}
      ListFooterComponent={renderFooter}
      renderItem={({ item }) => (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text>Nome: {item.name}</Text>
          <Text>Preço: {item.price}</Text>
          <Text>Código de barras: {item.barcode || "Não informado"}</Text>
          {item.location ? (
            <Text>
              Localização: {item.location.latitude.toFixed(6)},{" "}
              {item.location.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text>Localização: Não informada</Text>
          )}

          <View style={{ marginTop: 10 }}>
            <Button title="Editar" onPress={() => handleEditProduct(item)} />
          </View>

          <View style={{ marginTop: 10 }}>
            <Button
              title="Excluir"
              onPress={() => handleDeleteProduct(item.id)}
            />
          </View>
        </View>
      )}
    />
  );
}
