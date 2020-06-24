import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Branch from 'react-native-branch';
import LottieView from 'lottie-react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { colors } from '../../../styles/common';
import DeeplinkManager from '../../../core/DeeplinkManager';
import Logger from '../../../util/Logger';
import Device from '../../../util/Device';
import SplashScreen from 'react-native-splash-screen';

/**
 * Entry Screen that decides which screen to show
 * depending on the state of the user
 * new, existing , logged in or not
 * while showing the fox
 */
const LOGO_SIZE = 175;
const LOGO_PADDING = 25;
const styles = StyleSheet.create({
	main: {
		flex: 1,
		backgroundColor: colors.white
	},
	metamaskName: {
		marginTop: 10,
		height: 25,
		width: 170,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	logoWrapper: {
		backgroundColor: colors.white,
		paddingTop: 50,
		marginTop: Dimensions.get('window').height / 2 - LOGO_SIZE / 2 - LOGO_PADDING,
		height: LOGO_SIZE + LOGO_PADDING * 2
	},
	foxAndName: {
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	animation: {
		width: 110,
		height: 110,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	fox: {
		width: 110,
		height: 110,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

class Entry extends PureComponent {
	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object,
		/**
		 * Boolean flag that determines if password has been set
		 */
		passwordSet: PropTypes.bool
	};

	state = {
		viewToGo: null
	};

	animation = React.createRef();
	animationName = React.createRef();
	opacity = new Animated.Value(1);

	async componentDidMount() {
		DeeplinkManager.init(this.props.navigation);
		this.unsubscribeFromBranch = Branch.subscribe(this.handleDeeplinks);
		SplashScreen.hide();
		const existingUser = await AsyncStorage.getItem('@MetaMask:existingUser');
		if (existingUser !== null) {
			await this.unlockKeychain();
		} else {
			this.animateAndGoTo('OnboardingRootNav');
		}
	}

	handleDeeplinks = ({ error, params, uri }) => {
		if (error) {
			Logger.error(error, 'Error from Branch');
			return;
		}
		if (params['+non_branch_link']) {
			DeeplinkManager.parse(params['+non_branch_link']);
		} else if (uri) {
			DeeplinkManager.parse(uri);
		}
	};

	componentWillUnmount() {
		if (this.unsubscribeFromBranch) {
			this.unsubscribeFromBranch();
			this.unsubscribeFromBranch = null;
		}
	}

	animateAndGoTo(view) {
		this.setState({ viewToGo: view }, () => {
			if (Device.isAndroid()) {
				this.animation ? this.animation.play(0, 25) : this.onAnimationFinished();
				this.animationName && this.animationName.play();
			} else {
				this.animation.play();
				this.animationName.play();
			}
		});
	}

	onAnimationFinished = () => {
		const { viewToGo } = this.state;
		Animated.timing(this.opacity, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
			isInteraction: false
		}).start(() => {
			if (viewToGo !== 'WalletView' || viewToGo !== 'Onboarding') {
				this.props.navigation.navigate(viewToGo);
			} else if (viewToGo === 'Onboarding') {
				this.props.navigation.navigate(
					'OnboardingRootNav',
					{},
					NavigationActions.navigate({ routeName: 'Oboarding' })
				);
			} else {
				this.props.navigation.navigate('HomeNav', {}, NavigationActions.navigate({ routeName: 'WalletView' }));
			}
		});
	};

	async unlockKeychain() {
		if (this.props.passwordSet) {
			this.animateAndGoTo('Login');
		} else {
			this.animateAndGoTo('Onboarding');
		}
	}

	renderAnimations() {
		if (!this.state.viewToGo) {
			return <LottieView style={styles.animation} autoPlay source={require('../../../animations/bounce.json')} />;
		}

		return (
			<View style={styles.foxAndName}>
				<LottieView
					// eslint-disable-next-line react/jsx-no-bind
					ref={animation => {
						this.animation = animation;
					}}
					style={styles.animation}
					loop={false}
					source={require('../../../animations/fox-in.json')}
					onAnimationFinish={this.onAnimationFinished}
				/>
				<LottieView
					// eslint-disable-next-line react/jsx-no-bind
					ref={animation => {
						this.animationName = animation;
					}}
					style={styles.metamaskName}
					loop={false}
					source={require('../../../animations/wordmark.json')}
				/>
			</View>
		);
	}

	render() {
		return (
			<View style={styles.main}>
				<Animated.View style={[styles.logoWrapper, { opacity: this.opacity }]}>
					<View style={styles.fox}>{this.renderAnimations()}</View>
				</Animated.View>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	passwordSet: state.user.passwordSet
});

export default connect(mapStateToProps)(Entry);
