// =============================================================================
// DisciplinedAssistantStrategy.cs
// NinjaTrader 8 - Semi-automated "disciplined assistant" for futures trading.
// Does NOT submit orders; provides visual/audio signals and optional ATM
// application guidance when manual positions are detected.
//
// Install: Copy this file to Documents\NinjaTrader 8\bin\Custom\Strategies\
// then compile via NinjaTrader Control Center > New > NinjaScript Editor > Compile.
// =============================================================================

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Windows.Media;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.Gui;
using NinjaTrader.NinjaScript;

namespace NinjaTrader.NinjaScript.Strategies
{
	/// <summary>
	/// Acts as a disciplined assistant: generates entry signals (visual/audio) only.
	/// Does not submit orders. Optionally notifies when a manual position is detected
	/// so the user can apply an ATM template from the Control Center.
	/// </summary>
	public class DisciplinedAssistantStrategy : Strategy
	{
		#region User Input Parameters

		[NinjaScriptProperty]
		[Display(Name = "Enable signals", Description = "Master switch for signal generation", Order = 0, GroupName = "1. Signals")]
		public bool EnableSignals { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Play alert sound", Description = "Play a sound when a signal occurs", Order = 1, GroupName = "1. Signals")]
		public bool PlayAlertSound { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Signal sound file", Description = "Path to custom sound file (e.g. .wav). Empty = default alert sound.", Order = 2, GroupName = "1. Signals")]
		public string SignalSoundFile { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Draw signals on chart", Description = "Draw arrows at signal locations", Order = 3, GroupName = "1. Signals")]
		public bool DrawSignalsOnChart { get; set; }

		[NinjaScriptProperty]
		[Range(0, int.MaxValue)]
		[Display(Name = "Signal arrow offset (ticks)", Description = "Offset in ticks for arrow placement from bar high/low", Order = 4, GroupName = "1. Signals")]
		public int SignalArrowOffset { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Signal bar index lookback", Description = "Bars to consider for signal (0 = current bar only)", Order = 5, GroupName = "1. Signals")]
		public int SignalBarIndexLookback { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Use ATM after manual entry", Description = "When true, attempt to apply ATM when a manual position is detected (see comments in code)", Order = 0, GroupName = "2. ATM")]
		public bool UseATMAfterManualEntry { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "ATM template name", Description = "Name of ATM strategy template (e.g. MyScalpTemplate, Breakout 1R)", Order = 1, GroupName = "2. ATM")]
		public string ATMTemplateName { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Calculate mode", Description = "When to evaluate conditions (OnBarClose = once per bar)", Order = 0, GroupName = "3. Behavior")]
		public CalculateMode CalculateMode { get; set; }

		// --- Custom entry logic placeholders (replace with your own conditions) ---
		[NinjaScriptProperty]
		[Range(1, int.MaxValue)]
		[Display(Name = "Fast MA period", Description = "Fast moving average period for sample/placeholder logic", Order = 0, GroupName = "4. Entry logic (customize)")]
		public int FastMAPeriod { get; set; }

		[NinjaScriptProperty]
		[Range(1, int.MaxValue)]
		[Display(Name = "Slow MA period", Description = "Slow moving average period for sample/placeholder logic", Order = 1, GroupName = "4. Entry logic (customize)")]
		public int SlowMAPeriod { get; set; }

		[NinjaScriptProperty]
		[Display(Name = "Order flow imbalance threshold", Description = "Minimum order flow imbalance (e.g. 1.5) for advanced users", Order = 2, GroupName = "4. Entry logic (customize)")]
		public double OrderFlowImbalanceThreshold { get; set; }

		#endregion

		#region Variables

		private bool signalLong;
		private bool signalShort;
		private bool signalFiredThisBar;
		private double tickSize;
		private int signalBarIndex;
		private readonly HashSet<string> atmAppliedOrderIds = new HashSet<string>();

		#endregion

		#region OnStateChange

		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Description = "Semi-automated assistant: signals only, no auto orders. Optional ATM notification on manual entry.";
				Name = "DisciplinedAssistant";
				IsUnmanaged = true;
				IsOverlay = true;
				Calculate = Calculate.OnBarClose;

				EnableSignals = true;
				PlayAlertSound = true;
				SignalSoundFile = "";
				DrawSignalsOnChart = true;
				SignalArrowOffset = 2;
				SignalBarIndexLookback = 0;
				UseATMAfterManualEntry = false;
				ATMTemplateName = "Breakout 1R";
				CalculateMode = CalculateMode.OnBarClose;

				FastMAPeriod = 10;
				SlowMAPeriod = 30;
				OrderFlowImbalanceThreshold = 1.5;
			}
			else if (State == State.Configure)
			{
				// Apply user-selected calculate mode
				Calculate = CalculateMode == CalculateMode.OnBarClose ? Calculate.OnBarClose
					: CalculateMode == CalculateMode.OnEachTick ? Calculate.OnEachTick
					: Calculate.OnPriceChange;
			}
			else if (State == State.DataLoaded)
			{
				tickSize = Instrument.MasterInstrument.TickSize;
				if (tickSize <= 0) tickSize = 0.25;
			}
		}

		#endregion

		#region OnBarUpdate

		protected override void OnBarUpdate()
		{
			// ----- Guard: only run in realtime for signals (optional: allow historical for backtest of signal logic) -----
			// if (State != State.Realtime) return;

			if (CurrentBar < Math.Max(FastMAPeriod, SlowMAPeriod) + SignalBarIndexLookback)
				return;

			ResetSignals();

			// ----- USER: Set signalLong and signalShort here. Example (commented) using EMA cross -----
			// double fast = EMA(FastMAPeriod)[SignalBarIndex];
			// double slow = EMA(SlowMAPeriod)[SignalBarIndex];
			// bool crossUp  = CrossAbove(EMA(FastMAPeriod), EMA(SlowMAPeriod), 1);
			// bool crossDn  = CrossBelow(EMA(FastMAPeriod), EMA(SlowMAPeriod), 1);
			// if (crossUp) signalLong  = true;
			// if (crossDn) signalShort = true;

			// Placeholder: simple EMA cross (enable and customize as needed)
			signalBarIndex = SignalBarIndexLookback;
			double fastMa = EMA(FastMAPeriod)[signalBarIndex];
			double slowMa = EMA(SlowMAPeriod)[signalBarIndex];
			bool crossAbove = CrossAbove(EMA(FastMAPeriod), EMA(SlowMAPeriod), 1);
			bool crossBelow = CrossBelow(EMA(FastMAPeriod), EMA(SlowMAPeriod), 1);
			if (crossAbove) signalLong = true;
			if (crossBelow) signalShort = true;

			// ----- Optional: add order flow imbalance filter (replace with your data source) -----
			// if (signalLong  && GetOrderFlowImbalance() < OrderFlowImbalanceThreshold) signalLong  = false;
			// if (signalShort && GetOrderFlowImbalance() > -OrderFlowImbalanceThreshold) signalShort = false;

			if (!EnableSignals) return;

			// One signal per bar to avoid repeated alerts
			if (signalFiredThisBar) return;
			if (signalLong)
			{
				signalFiredThisBar = true;
				HandleSignalLong();
			}
			else if (signalShort)
			{
				signalFiredThisBar = true;
				HandleSignalShort();
			}
		}

		#endregion

		#region Signal Handling

		/// <summary>Process a long signal: alert and/or draw arrow.</summary>
		private void HandleSignalLong()
		{
			try
			{
				if (PlayAlertSound)
					Alert("DisciplinedAssistantLong", AlertPriority.Medium, "Long signal", SignalSoundFile ?? "", 10, Brushes.Green, Brushes.Black);

				if (DrawSignalsOnChart)
				{
					double y = Low[signalBarIndex] - (SignalArrowOffset * tickSize);
					Draw.ArrowUp(this, "SignalLong_" + CurrentBar, true, signalBarIndex, y, Brushes.Lime);
				}

				Print(string.Format("{0} | Long signal at bar {1}", Time[signalBarIndex], CurrentBar));
			}
			catch (Exception ex)
			{
				Print("DisciplinedAssistantStrategy HandleSignalLong error: " + ex.Message);
			}
		}

		/// <summary>Process a short signal: alert and/or draw arrow.</summary>
		private void HandleSignalShort()
		{
			try
			{
				if (PlayAlertSound)
					Alert("DisciplinedAssistantShort", AlertPriority.Medium, "Short signal", SignalSoundFile ?? "", 10, Brushes.Red, Brushes.Black);

				if (DrawSignalsOnChart)
				{
					double y = High[signalBarIndex] + (SignalArrowOffset * tickSize);
					Draw.ArrowDown(this, "SignalShort_" + CurrentBar, true, signalBarIndex, y, Brushes.OrangeRed);
				}

				Print(string.Format("{0} | Short signal at bar {1}", Time[signalBarIndex], CurrentBar));
			}
			catch (Exception ex)
			{
				Print("DisciplinedAssistantStrategy HandleSignalShort error: " + ex.Message);
			}
		}

		/// <summary>Reset signal flags at the start of each bar so new signals can fire.</summary>
		private void ResetSignals()
		{
			signalLong = false;
			signalShort = false;
			signalFiredThisBar = false;
		}

		#endregion

		#region ATM Handling

		/// <summary>
		/// NinjaTrader 8 does not provide an API to attach an ATM strategy to an *existing* position
		/// that was opened by a manual order. AtmStrategyCreate() submits a *new* entry order and
		/// attaches the ATM to that order—it cannot be used to "apply ATM to current position."
		/// So when a manual position is detected, we notify the user to apply the ATM from the
		/// Control Center (Positions tab > Right-click position > Apply ATM Strategy).
		/// </summary>
		protected override void OnExecutionUpdate(Execution execution, string executionId, double price, int quantity, MarketPosition marketPosition, string orderId, DateTime time)
		{
			if (!UseATMAfterManualEntry || string.IsNullOrWhiteSpace(ATMTemplateName)) return;
			if (State != State.Realtime) return;
			if (execution == null || execution.Order == null) return;

			try
			{
				// Only care about fills that open or add to a position (entry)
				if (quantity <= 0) return;
				if (execution.Order.Instrument != Instrument) return;

				string id = execution.Order.Id ?? executionId ?? executionId + orderId;
				if (string.IsNullOrEmpty(id)) return;
				lock (atmAppliedOrderIds)
				{
					if (atmAppliedOrderIds.Contains(id)) return;
					atmAppliedOrderIds.Add(id);
				}

				// AtmStrategyCreate() is for *submitting a new order* with an ATM; it cannot attach
				// to this execution's order. So we only notify.
				Print(string.Format("DisciplinedAssistantStrategy: Manual entry detected (order fill). Apply ATM template \"{0}\" from Control Center > Positions > Right-click position > Apply ATM Strategy.", ATMTemplateName));
				Alert("DisciplinedAssistantATM", AlertPriority.Medium, "Manual position detected. Apply ATM: " + ATMTemplateName, "", 5, Brushes.Gold, Brushes.Black);
			}
			catch (Exception ex)
			{
				Print("DisciplinedAssistantStrategy OnExecutionUpdate error: " + ex.Message);
			}
		}

		#endregion

		#region Cleanup

		protected override void OnTermination()
		{
			try
			{
				lock (atmAppliedOrderIds)
					atmAppliedOrderIds.Clear();
			}
			catch { /* ignore */ }
		}

		#endregion
	}

	/// <summary>Calculate mode for bar/tick evaluation.</summary>
	public enum CalculateMode
	{
		OnBarClose,
		OnEachTick,
		OnPriceChange
	}
}
