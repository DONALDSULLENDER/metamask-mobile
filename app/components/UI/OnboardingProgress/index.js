import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors, fontStyles } from '../../../styles/common';
import { Text, View, StyleSheet } from 'react-native';
import { strings } from '../../../../locales/i18n';

const ellipsisSize = 20;
const borderRadius = ellipsisSize / 2;

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		marginBottom: 30
	},
	step: {
		display: 'flex',
		alignItems: 'center'
	},
	stepText: {
		marginTop: 4,
		fontSize: 11,
		color: colors.black
	},
	stepTextSelected: {
		color: colors.blue
	},
	row: {
		display: 'flex',
		flexDirection: 'row'
	},
	onboarding: {
		justifyContent: 'space-between',
		zIndex: 2
	},
	ellipsis: {
		width: ellipsisSize,
		height: ellipsisSize,
		borderWidth: 2,
		borderColor: colors.grey200,
		backgroundColor: colors.white,
		borderRadius
	},
	ellipsisText: {
		fontSize: 11,
		textAlign: 'center',
		...fontStyles.bold,
		color: colors.grey200
	},
	ellipsisSelected: {
		borderColor: colors.blue,
		color: colors.blue
	},
	ellipsisCompleted: {
		borderColor: colors.blue,
		backgroundColor: colors.blue
	},
	ellipsisTextCompleted: {
		color: colors.white
	},
	first: {
		marginLeft: -1
	},
	lines: {
		zIndex: 1,
		position: 'absolute',
		top: borderRadius,
		marginHorizontal: 24
	},
	line: {
		width: '50%',
		height: 2,
		backgroundColor: colors.grey200
	},
	lineSelected: {
		backgroundColor: colors.blue
	}
});

export default class OnboardingProgress extends Component {
	static propTypes = {
		currentStep: PropTypes.number.isRequired
	};

	render() {
		const { currentStep } = this.props;

		const steps = [strings('onboarding.step1'), strings('onboarding.step2'), strings('onboarding.step3')];
		const lines = steps.filter((step, index) => index !== steps.length - 1);
		return (
			<View style={styles.container}>
				<View style={[styles.row, styles.onboarding]}>
					{steps.map((step, key) => {
						const isSelected = key + 1 === currentStep;
						const isCompleted = key + 1 < currentStep;

						const isFirst = key === 0;
						return (
							<View key={key} style={styles.step}>
								<View
									style={[
										styles.ellipsis,
										isSelected && styles.ellipsisSelected,
										isCompleted && styles.ellipsisCompleted
									]}
								>
									<Text
										style={[
											styles.ellipsisText,
											isSelected && styles.ellipsisSelected,
											isCompleted && styles.ellipsisTextCompleted,
											isFirst && styles.first
										]}
									>
										{key + 1}
									</Text>
								</View>
								<Text style={[styles.stepText, (isSelected || isCompleted) && styles.stepTextSelected]}>
									{steps[key]}
								</Text>
							</View>
						);
					})}
				</View>
				<View style={[styles.row, styles.lines]}>
					{lines.map((step, key) => {
						const isSelected = key + 1 < currentStep;
						return <View key={key} style={[styles.line, isSelected && styles.lineSelected]} />;
					})}
				</View>
			</View>
		);
	}
}
