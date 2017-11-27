/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
  Button,
  Alert,
  TextInput
} from 'react-native';

var myIp = "192.168.0.19";

export default class ShopifyTest extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {products : this.ds.cloneWithRows([])};
    this.loadProducts();
  }
  loadProducts() {
    this.state.products = this.ds.cloneWithRows([]);
    fetch("http://"+myIp+":5000/products", {method: "GET"})
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({products: this.ds.cloneWithRows(responseData)});
      })
      .catch((error) => {
        console.log(error);
      })
      .done();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Shopify Test
        </Text>
        <ListView style={styles.listView}
          dataSource={this.state.products}
          enableEmptySections={true}
          renderRow={(product, sectionId, rowId) => {
            return (<View style={styles.listItem}>
                <Image style={styles.image} source={{uri: product.image.src}}/>
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.comparePrice}>{product.variants[0].compare_at_price || ""}</Text>
                <Text style={styles.price}>{"$ " + product.variants[0].price}</Text>
                <Button
                  style={styles.buyButton}
                  onPress={this.buy.bind(this, product.variants[0])}
                  title="Buy"
                  accessibilityLabel="Buy this product"
                />
                <Text style={styles.inventory}>{'Inventory : ' + product.variants[0].inventory_quantity}</Text>
                <View>
                  <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => product.variants[0].updateQty = text}
                    value= {product.variants[0].updateQty} />
                  <Button onPress={this.update.bind(this,product.variants[0])} title="Add Stock" accessibilityLabel="Update Stock"/>
                </View>
            </View>
          )}}
        />
      </View>
    )
  };
  buy(variant) {
    
    fetch("http://"+myIp+":5000/product/buy", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          "variantId" : variant.id,
          "quantity": 1,
          "discount" : 0.25
        })
      })
      .then((response) => response.json())
      .then((responseData) => {
        Alert.alert("Invoice",responseData.invoice_url,
          [{text: 'OK'}],
          { cancelable: false }
          );
      })
      .catch((error) => {
        console.log(error);
      })
      .done();
  };
  update(variant) {
    fetch("http://"+myIp+":5000/product/addInventory", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          "variantId" : variant.id,
          "quantity": variant.updateQty
        })
      })
      .then((response) => response.json())
      .then((responseData) => {
        this.loadProducts();
        Alert.alert("Stock Updated");
      })
      .catch((error) => {
        console.log(error);
      })
      .done();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 25,
    textAlign: 'center',
  },
  image: {
    width : 200,
    height : 120
  },
  listView :{
    flex : 7
  },
  listItem: {
    margin :10
  },
  title: {
    fontSize: 24
  },
  comparePrice :{
    fontSize: 30
  },
  price :{
    fontSize: 30
  },
  buyButton :{
    fontSize: 30
  },
  inventory: {
    fontSize: 30
  }
});


AppRegistry.registerComponent('ShopifyTest', () => ShopifyTest);
